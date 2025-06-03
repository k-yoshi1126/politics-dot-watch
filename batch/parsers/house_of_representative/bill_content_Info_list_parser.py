from datetime import date
from typing import Dict, Union, List
import logging
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class BillContentInfoListParser(BaseParser):
    """議案本文情報一覧パーサー"""

    def parse(self) -> List[Dict[str, str]]:
        """議案本文情報のリンクとテキストを取得"""
        result = []

        try:
            # 本文情報のリンクを含むspan要素を取得
            content_span = self.soup.find("span", class_="txt03ul")
            if not content_span:
                logger.warning("議案本文情報の要素が見つかりませんでした")
                return result

            # ul要素内のリンクを取得
            ul = content_span.find("ul")
            if not ul:
                logger.warning("議案本文情報のリストが見つかりませんでした")
                return result

            # 各リンクを処理
            for li in ul.find_all("li"):
                try:
                    link = li.find("a")
                    if not link:
                        continue

                    # リンクのテキストとURLを取得
                    text = link.get_text().strip()
                    url = self._normalize_url_path(link.get("href", ""))

                    if text and url:
                        result.append({"テキスト": text, "URL": url})
                except Exception as e:
                    logger.error(f"リンク処理中にエラーが発生しました: エラー={str(e)}")
                    continue

        except Exception as e:
            logger.error(f"パース中にエラーが発生しました: {str(e)}")
            raise

        return result
