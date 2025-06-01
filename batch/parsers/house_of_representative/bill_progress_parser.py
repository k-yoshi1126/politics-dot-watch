from bs4 import BeautifulSoup
from datetime import datetime, date
from typing import Dict, Optional, Union
import logging
import re
from japanera import EraDate, Era
import chardet
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class BillProgressParser(BaseParser):
    """法案進捗情報パーサー"""

    def __init__(self, html_content: Union[str, bytes]):
        # strで渡された場合はencodeしてbytesに、bytesならそのまま
        if isinstance(html_content, str):
            html_bytes = html_content.encode()
        else:
            html_bytes = html_content
        # 文字コードを自動検出
        detected = chardet.detect(html_bytes)
        encoding = detected["encoding"]
        logger.info(f"検出された文字コード: {encoding}")
        # ここでdecodeしてstr化する（strならfrom_encodingは不要）
        html_text = html_bytes.decode(encoding, errors="replace")

        # BeautifulSoupに渡すときはfrom_encodingを削除
        self.soup = BeautifulSoup(html_text, "lxml")

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

    def parse(self) -> Dict[str, Union[str, int, date, None]]:
        """法案進捗情報を解析"""
        result = {}
        try:
            # 1つ目のテーブル
            first_table = self.soup.find(
                "table",
                {"class": "table", "summary": "この表は横2列、縦20行の表です。"},
            )
            if not first_table:
                logger.warning("1つ目のテーブルが見つかりませんでした")
            else:
                for i, row in enumerate(first_table.find_all("tr")):
                    cells = row.find_all("td")
                    if len(cells) == 2:
                        key_span = cells[0].find("span", class_="txt03")
                        value_span = cells[1].find("span", class_="txt03")
                        if not key_span or not value_span:
                            logger.error(
                                f"テーブル1の{i+1}行目: キーまたは値の要素が見つかりません"
                            )
                            continue

                        key_cell = key_span.text.strip()
                        value_cell = value_span.text.strip()

                        # keyに'／'がある場合の分割処理
                        if "／" in key_cell:
                            key_cell = (
                                key_cell.replace("\n", "")
                                .replace("\r", "")
                                .replace("\u3000", " ")
                            )
                            keys = [k.strip() for k in key_cell.split("／")]
                        else:
                            keys = [key_cell]
                        # valueに'／'がある場合の分割処理
                        if "／" in value_cell:
                            value_cell = (
                                value_cell.replace("\n", "")
                                .replace("\r", "")
                                .replace("\u3000", " ")
                            )
                            values = [v.strip() for v in value_cell.split("／")]
                        else:
                            values = [value_cell]

                        for j, key in enumerate(keys):
                            if key:  # 空のキーは無視
                                if j < len(values):
                                    try:
                                        # 数値フィールドの変換
                                        if key in ["議案提出回次", "議案番号"]:
                                            result[key] = self._convert_to_int(
                                                values[j]
                                            )
                                        # 日付フィールドの変換
                                        elif any(
                                            date_key in key
                                            for date_key in ["年月日", "日付"]
                                        ):
                                            result[key] = self._parse_date(values[j])
                                        # その他のフィールド
                                        else:
                                            result[key] = self._convert_empty_to_none(
                                                values[j]
                                            )
                                    except Exception as e:
                                        logger.error(
                                            f"フィールド変換エラー: キー={key}, 値={values[j]}, エラー={str(e)}"
                                        )
                                else:
                                    logger.error(
                                        f"値が不足しています: キー={key}, 必要な値の数={j + 1}, 実際の値の数={len(values)}"
                                    )

            # 2つ目のテーブル
            second_table = self.soup.find(
                "table", {"class": "table", "summary": "この表は横2列、縦2行の表です。"}
            )
            if not second_table:
                logger.warning("2つ目のテーブルが見つかりませんでした")
            else:
                for i, row in enumerate(second_table.find_all("tr")):
                    cells = row.find_all("td")
                    if len(cells) == 2:
                        key_span = cells[0].find("span", class_="txt03")
                        value_span = cells[1].find("span", class_="txt03")
                        if not key_span or not value_span:
                            logger.error(
                                f"テーブル2の{i+1}行目: キーまたは値の要素が見つかりません"
                            )
                            continue

                        key = key_span.text.strip()
                        value = value_span.text.strip()
                        try:
                            result[key] = self._convert_empty_to_none(value)
                        except Exception as e:
                            logger.error(
                                f"フィールド変換エラー: キー={key}, 値={value}, エラー={str(e)}"
                            )

        except Exception as e:
            logger.error(f"パース中にエラーが発生しました: {str(e)}")
            raise

        return result
