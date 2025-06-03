import re
from datetime import datetime
from typing import List, Optional, Dict
from urllib.parse import urljoin
import logging
import os

import requests
from bs4 import BeautifulSoup

# ログ設定
log_level = os.getenv("LOG_LEVEL", "INFO")
logging.basicConfig(
    level=getattr(logging, log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


class BaseScraper:
    """スクレイピングの基底クラス"""

    def __init__(self, wait_time: int = 2):
        self.wait_time = wait_time
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )

    def get_page_content(self, url: str) -> Optional[BeautifulSoup]:
        """ページの内容を取得"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return BeautifulSoup(response.content, "html.parser")
        except Exception as e:
            print(f"❌ ページ取得エラー: {e}")
            return None

    def extract_table_data(
        self, soup: BeautifulSoup, table_class: str = "table"
    ) -> List[List[str]]:
        """汎用的なテーブルデータ抽出"""
        table_data = []

        # 表を取得
        table = soup.find("table", class_=table_class)
        if not table:
            return table_data

        # データ行を取得
        for row in table.find_all("tr"):
            row_data = []
            for cell in row.find_all(["td", "th"]):
                # テキストを取得
                text = cell.get_text().strip()
                row_data.append(text)

            if row_data:  # 空でない場合のみ追加
                table_data.append(row_data)

        return table_data

    def parse_japanese_date(self, date_str: str) -> Optional[datetime]:
        """日本語日付をパース"""
        try:
            # 令和年号
            reiwa_match = re.search(r"令和(\d+)年(\d+)月(\d+)日", date_str)
            if reiwa_match:
                reiwa_year = int(reiwa_match.group(1))
                month = int(reiwa_match.group(2))
                day = int(reiwa_match.group(3))
                western_year = reiwa_year + 2018  # 令和元年 = 2019年
                return datetime(western_year, month, day)

            # 平成年号
            heisei_match = re.search(r"平成(\d+)年(\d+)月(\d+)日", date_str)
            if heisei_match:
                heisei_year = int(heisei_match.group(1))
                month = int(heisei_match.group(2))
                day = int(heisei_match.group(3))
                western_year = heisei_year + 1988  # 平成元年 = 1989年
                return datetime(western_year, month, day)

            return None
        except:
            return None
