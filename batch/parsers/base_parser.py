from bs4 import BeautifulSoup
from datetime import date
from typing import Dict, Optional, List, Union
import logging
import re
from japanera import EraDate, Era
import chardet
from abc import ABC, abstractmethod
import jaconv

logger = logging.getLogger(__name__)


class BaseParser(ABC):
    """パーサーの基底クラス"""

    def __init__(self, html_content: bytes):
        # 文字コードを検出
        result = chardet.detect(html_content)
        encoding = result["encoding"]

        # 文字コードを指定してデコード
        html_str = html_content.decode(encoding)

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
        """テキストの形式を正規化する

        Args:
            text (str): 正規化するテキスト

        Returns:
            str: 正規化されたテキスト
            - 連続する全角空白は削除
            - 1つの全角空白は半角空白に変換
            - 全角数字は半角数字に変換
        """
        # 全角数字を半角数字に変換
        text = jaconv.z2h(text, digit=True, ascii=False)
        # 連続する全角空白を1つの半角空白に変換
        text = re.sub(r"\u3000+", " ", text)
        # 先頭と末尾の空白を削除
        return text.strip()
