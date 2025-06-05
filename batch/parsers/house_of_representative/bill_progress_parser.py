from datetime import date
from typing import Dict, Union
import logging
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class BillProgressParser(BaseParser):
    """法案進捗情報パーサー"""

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
                                        # 議案提出者の変換
                                        elif key == "議案提出者":
                                            result[key] = self.convert_submitter_format(
                                                self._convert_empty_to_none(values[j])
                                            )
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
