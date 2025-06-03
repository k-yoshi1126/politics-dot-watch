from typing import Dict, Union, List
import logging
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class OutlineParser(BaseParser):
    """要綱パーサー"""

    def parse(self) -> Dict[str, str]:
        """要綱の内容を取得

        Returns:
            Dict[str, str]: 要綱の内容
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

            # 要綱の内容を取得（h2タグの閉じタグの後からmainlayoutの終わりまで）
            outline_parts = []
            current = top_contents.find_next_sibling()
            while current and current in mainlayout.descendants:
                if current.name == "p":
                    text = current.get_text().strip()
                    if text:
                        logger.debug(f"pタグのテキスト（正規化前）: {repr(text)}")
                        normalized_text = self.normalize_text_format(text)
                        logger.debug(
                            f"pタグのテキスト（正規化後）: {repr(normalized_text)}"
                        )
                        outline_parts.append(normalized_text)
                elif current.string:  # テキストノードの場合
                    text = current.string.strip()
                    if text:
                        logger.debug(f"テキストノード（正規化前）: {repr(text)}")
                        normalized_text = self.normalize_text_format(text)
                        logger.debug(
                            f"テキストノード（正規化後）: {repr(normalized_text)}"
                        )
                        outline_parts.append(normalized_text)
                current = current.next_sibling

            # 空行を適切に処理
            outline_text = "\n".join(outline_parts)
            logger.debug(f"結合後のテキスト: {repr(outline_text)}")

            # 連続する空行を1つに
            while "\n\n\n" in outline_text:
                outline_text = outline_text.replace("\n\n\n", "\n\n")
            # 先頭と末尾の空行を削除
            outline_text = outline_text.strip()
            logger.debug(f"空行処理後のテキスト: {repr(outline_text)}")

            # h2タグの内容を除外
            h2_text = top_contents.get_text().strip()
            if outline_text.startswith(h2_text):
                outline_text = outline_text[len(h2_text) :].strip()
                logger.debug(f"h2タグ除外後のテキスト: {repr(outline_text)}")

            # 要綱の内容が空でない場合のみ結果を返す
            if outline_text:
                result["要綱"] = outline_text

        except Exception as e:
            logger.error(f"パース中にエラーが発生しました: {str(e)}")
            raise

        return result
