from typing import Dict, Union, List
import logging
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class AmendmentParser(BaseParser):
    """修正案パーサー"""

    def parse(self) -> Dict[str, str]:
        """修正案の内容を取得

        Returns:
            Dict[str, str]: 修正案の内容
        """
        result = {}

        try:
            # TopContentsのh2タグを取得
            top_contents = self.soup.find("h2", id="TopContents")
            if not top_contents:
                logger.warning("TopContentsの要素が見つかりませんでした")
                return result

            # mainlayoutのdivを取得
            mainlayout = self.soup.find("div", id="mainlayout")
            if not mainlayout:
                logger.warning("mainlayoutの要素が見つかりませんでした")
                return result

            # 修正案の内容を取得（h2タグの閉じタグの後からmainlayoutの終わりまで）
            amendment_parts = []
            current = top_contents.find_next_sibling()
            while current and current in mainlayout.descendants:
                if current.name == "p":
                    text = current.get_text().strip()
                    if text:
                        amendment_parts.append(text)
                elif current.string:  # テキストノードの場合
                    text = current.string.strip()
                    if text:
                        amendment_parts.append(text)
                current = current.next_sibling

            # 空行を適切に処理
            amendment_text = "\n".join(amendment_parts)
            # 連続する空行を1つに
            while "\n\n\n" in amendment_text:
                amendment_text = amendment_text.replace("\n\n\n", "\n\n")
            # 先頭と末尾の空行を削除
            amendment_text = amendment_text.strip()

            # h2タグの内容を除外
            h2_text = top_contents.get_text().strip()
            if amendment_text.startswith(h2_text):
                amendment_text = amendment_text[len(h2_text) :].strip()

            # 修正案の内容が空でない場合のみ結果を返す
            if amendment_text:
                result["修正案"] = self.normalize_text_format(amendment_text)

        except Exception as e:
            logger.error(f"パース中にエラーが発生しました: {str(e)}")
            raise

        return result
