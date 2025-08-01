from typing import Dict
import logging
from ..base_parser import BaseParser

logger = logging.getLogger(__name__)


class SubmitContentParser(BaseParser):
    """提出時法律案パーサー"""

    def parse(self) -> Dict[str, str]:
        """提出時法律案の内容を取得

        Returns:
            Dict[str, str]: 提出時法律案の内容
        """
        result = {}

        try:
            # 議案メタ情報の取得
            word_section = self.soup.find("div", class_="WordSection1")
            if not word_section:
                logger.warning("議案メタ情報の要素が見つかりませんでした")
                return result

            # 附則の位置を特定（完全一致で検索）
            appendix = None
            for p in self.soup.find_all("p", class_="MsoNormal"):
                norm_text = self.normalize_text(p.get_text())
                if norm_text == "附則":
                    appendix = p
                    break

            if not appendix:
                logger.warning("附則の要素が見つかりませんでした")
                return result

            # 提出時法案内容の取得（WordSection1の次の要素から附則の前まで）
            content_parts = []
            current = word_section.find_next("p", class_="MsoNormal")
            while current and current != appendix:
                content_parts.append(current.get_text().strip())
                current = current.find_next("p", class_="MsoNormal")
            result["提出時法案内容"] = "\n".join(content_parts)

            # 理由の位置を特定（完全一致で検索）
            reason = None
            for p in self.soup.find_all("p", class_="MsoNormal"):
                norm_text = self.normalize_text(p.get_text())
                if norm_text == "理由":
                    reason = p
                    break

            if not reason:
                logger.warning("理由の要素が見つかりませんでした")
                return result

            # 附則の取得（附則の次の要素から理由の前まで）
            appendix_parts = []
            current = appendix.find_next("p", class_="MsoNormal")
            while current and current != reason:
                appendix_parts.append(current.get_text().strip())
                current = current.find_next("p", class_="MsoNormal")
            result["附則"] = "\n".join(appendix_parts)

            # 理由の取得（理由の次の要素からmainlayoutの終わりまで）
            reason_parts = []
            current = reason.find_next("p", class_="MsoNormal")
            mainlayout = self.soup.find("div", id="mainlayout")
            while current and current in mainlayout.descendants:
                reason_parts.append(current.get_text().strip())
                current = current.find_next("p", class_="MsoNormal")
            result["理由"] = "\n".join(reason_parts)

        except Exception as e:
            logger.error(f"パース中にエラーが発生しました: {str(e)}")
            raise

        return result
