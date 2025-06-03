from typing import List
import logging

# from bs4 import BeautifulSoup
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class BillListParser(BaseParser):
    """議案一覧ページのパース処理クラス"""

    HEADERS = ["提出回次", "番号", "議案件名", "審議状況", "経過情報", "本文情報"]

    def parse(self) -> List[List[str]]:
        """議案一覧表のデータを抽出"""
        bill_list = []

        try:
            # 表を取得
            table = self.soup.find("table", class_="table")
            if not table:
                logger.warning("議案一覧のテーブルが見つかりませんでした")
                return bill_list

            # データ行を取得
            for i, row in enumerate(
                table.find_all("tr")[1:], 1
            ):  # ヘッダー行をスキップ
                try:
                    row_data = []
                    for td in row.find_all("td"):
                        try:
                            # リンクがある場合はリンクのURLを取得
                            link = td.find("a")
                            if link and "href" in link.attrs:
                                # URLパスを正規化
                                normalized_url = self._normalize_url_path(link["href"])
                                row_data.append(normalized_url)
                            else:
                                # 通常のテキストを取得
                                span = td.find("span", class_="txt03")
                                if span:
                                    row_data.append(span.get_text().strip())
                                else:
                                    row_data.append("")
                        except Exception as e:
                            logger.error(
                                f"セル処理中にエラーが発生しました: 行={i}, エラー={str(e)}"
                            )
                            row_data.append("")

                    if row_data:  # 空でない場合のみ追加
                        bill_list.append(row_data)
                except Exception as e:
                    logger.error(
                        f"行の処理中にエラーが発生しました: 行={i}, エラー={str(e)}"
                    )
                    continue

            # テーブルデータを出力
            self._format_table_output(bill_list)

        except Exception as e:
            logger.error(f"パース中にエラーが発生しました: {str(e)}")
            raise

        return bill_list

    def _format_table_output(self, table_data: List[List[str]]) -> None:
        """テーブルデータを整形して出力"""
        try:
            if not table_data:
                return

            # ヘッダー行を出力
            print("\n📋 データ一覧:")
            print("=" * 120)
            header_format = " ".join(f"{{:<{len(h) + 2}}}" for h in self.HEADERS)
            print(header_format.format(*self.HEADERS))
            print("-" * 120)

            # データ行を出力
            for row in table_data:
                try:
                    # 長いテキストは省略
                    formatted_row = []
                    for cell in row:
                        if len(cell) > 45:
                            formatted_row.append(cell[:42] + "...")
                        else:
                            formatted_row.append(cell)
                    print(header_format.format(*formatted_row))
                except Exception as e:
                    logger.error(
                        f"行の出力中にエラーが発生しました: 行={row}, エラー={str(e)}"
                    )
                    continue

            print("=" * 120)
            print(f"合計: {len(table_data)}件\n")

        except Exception as e:
            logger.error(f"テーブル出力中にエラーが発生しました: {str(e)}")
            raise
