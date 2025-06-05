from bs4 import BeautifulSoup
from datetime import date
from typing import Dict, Optional, List, Union
import logging
import re
from japanera import EraDate, Era
import chardet
from abc import ABC, abstractmethod
import jaconv
import unicodedata
import kanjize

logger = logging.getLogger(__name__)


class BaseParser(ABC):
    """パーサーの基底クラス"""

    def __init__(self, html_content: bytes):
        # 文字コードを検出
        result = chardet.detect(html_content)
        encoding = result["encoding"]

        # 文字コードを指定してデコード
        try:
            html_str = html_content.decode(encoding)
        except UnicodeDecodeError:
            # デコードに失敗した場合は、UTF-8で試行
            try:
                html_str = html_content.decode("utf-8")
            except UnicodeDecodeError:
                # UTF-8でも失敗した場合は、CP932（Windows-31J）で試行
                html_str = html_content.decode("cp932", errors="replace")

        # BeautifulSoupオブジェクトを生成
        self.soup = BeautifulSoup(html_str, "html.parser")

    def _convert_era_to_constant(self, era_str: str) -> Optional[str]:
        """元号文字列を返す（japaneraライブラリでは元号文字列を直接使用）"""
        # サポートされている元号の確認
        supported_eras = ["明治", "大正", "昭和", "平成", "令和"]
        if era_str in supported_eras:
            return era_str
        return None

    def _parse_date(self, date_str: str) -> Optional[date]:
        """日付文字列をdateに変換"""
        if not date_str or date_str == "／" or date_str == "<br />":
            return None

        try:
            # 日付文字列からスペースを完全に削除
            date_str = date_str.replace(" ", "").replace(
                "\u3000", ""
            )  # 全角スペースも削除

            # 正規表現で年月日を抽出（元号は任意）
            pattern = r"(明治|大正|昭和|平成|令和)(\d+)年(\d+)月(\d+)日"
            match = re.match(pattern, date_str)
            if match:
                era_str, year_str, month_str, day_str = match.groups()

                # 文字列を整数に変換
                year = int(year_str)
                month = int(month_str)
                day = int(day_str)

                # 元号を確認
                era = self._convert_era_to_constant(era_str)
                if era is None:
                    logger.error(f"不明な元号です: {era_str}")
                    return None

                # EraDateを使用して西暦に変換
                try:
                    era_date_str = f"{era_str}{year:02d}年{month:02d}月{day:02d}日"
                    parsed_dates = EraDate.strptime(era_date_str, "%-K%-y年%m月%d日")

                    if parsed_dates:
                        return parsed_dates[0].to_date()
                    else:
                        logger.error(f"日付のパースに失敗しました: {era_date_str}")
                        return None

                except Exception as e:
                    logger.error(f"日付変換エラー: {str(e)} (入力値: {era_date_str})")
                    return None
            else:
                logger.error(f"日付形式が不正です: {date_str}")
                return None
        except (ValueError, TypeError) as e:
            logger.error(f"日付変換エラー: {str(e)} (入力値: {date_str})")
            return None

    def _convert_empty_to_none(self, value: str) -> Optional[str]:
        """空文字列をNoneに変換"""
        if not value or value == "／" or value == "<br />":
            return None
        return value

    def _convert_to_int(self, value: str) -> Optional[int]:
        """文字列を整数に変換"""
        if not value or value == "／" or value == "<br />":
            return None
        try:
            return int(value)
        except (ValueError, TypeError) as e:
            logger.error(f"整数変換エラー: {str(e)} (入力値: {value})")
            return None

    @abstractmethod
    def parse(self) -> Union[Dict, List]:
        """HTMLをパースしてデータを抽出"""
        pass

    def _normalize_url_path(self, url_path: str) -> str:
        """URLパスを正規化する

        Args:
            url_path (str): 正規化するURLパス（例: './keika/1DDCEA6.htm'）

        Returns:
            str: 正規化されたURLパス（例: '/keika/1DDCEA6.htm'）
        """
        # './' を '/' に置換
        normalized_path = url_path.replace("./", "/")
        return normalized_path

    def normalize_text(self, text: str) -> str:
        """テキストを正規化する

        Args:
            text (str): 正規化するテキスト

        Returns:
            str: 正規化されたテキスト（全角・半角の空白を除去）
        """
        # 全角スペースを除去 → すべての空白（全角・半角）を1つに正規化
        return re.sub(r"\s+", "", text)

    def normalize_text_format(self, text: str) -> str:
        """テキストのフォーマットを正規化する

        Args:
            text (str): 正規化するテキスト

        Returns:
            str: 正規化されたテキスト
        """
        # よくある文字化けパターン（1文字＋@）を削除
        text = re.sub(r"[一-龯ぁ-んァ-ンａ-ｚＡ-Ｚ0-9]@", "", text)
        # REPLACEMENT CHARACTER（�）を除去
        text = text.replace("\ufffd", "")
        # 制御文字（カテゴリが "C" で始まる文字）を除去
        text = "".join(
            char for char in text if not unicodedata.category(char).startswith("C")
        )
        # 全角数字を半角に変換
        text = jaconv.z2h(text, digit=True, ascii=False)
        # 連続する全角スペースを1つの半角スペースに置換
        text = re.sub(r"　+", " ", text)
        # 先頭と末尾の空白を削除
        text = text.strip()
        return text

    def convert_submitter_format(self, value: str) -> str:
        """
        議案提出者の表記を変換する。
        例: 「◯◯ ◯◯君外八名」→「◯◯ ◯◯(ほか8名)」

        Args:
            value (str): 元の文字列

        Returns:
            str: 変換後の文字列
        """
        if not value:
            return value

        pattern = r"^(.*?)\s*君?\s*外([〇一二三四五六七八九十百千]+)名$"
        match = re.search(pattern, value.strip())

        if match:
            name_part = match.group(1).replace("　", " ").strip()
            kanji_number = match.group(2)
            try:
                # 漢数字を正規化（全角数字に変換）
                normalized_number = jaconv.z2h(kanji_number, digit=True, ascii=False)
                number = kanjize.kanji2number(normalized_number)
                return f"{name_part}(ほか{number}名)"
            except Exception as e:
                logger.error(
                    f"漢数字変換エラー: 入力値={kanji_number}, エラー={str(e)}"
                )
                # 変換できない場合はそのまま返す
                return value

        return value
