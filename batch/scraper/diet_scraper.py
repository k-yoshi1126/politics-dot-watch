import re
import time
from datetime import datetime
from typing import List, Optional, Dict, Tuple
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

from common import BaseScraper
from db.dao import DietSessionDao, BillProgressDao
from parsers.house_of_representative import BillListParser, BillProgressParser


class DietScraper(BaseScraper):
    """衆議院議案情報スクレイピングクラス"""

    def __init__(self, headless: bool = True, wait_time: int = 2):
        self.headless = headless
        self.driver = None
        self.wait_time = wait_time
        self.session = requests.Session()

    def initialize_driver(self):
        """Seleniumドライバーを初期化"""
        print("🚀 Chromeドライバーを起動中...")

        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.implicitly_wait(10)

    def close_driver(self):
        """ドライバーを終了"""
        if self.driver:
            self.driver.quit()
            print("🔚 ドライバーを終了しました")

    def scrape_bill_info(self, session: str):
        """スクレイピング"""
        try:
            print(f"📄 第{session}回国会の議案情報をスクレイピング")
            progress_page_paths, content_page_paths = self.scrape_bill_list(session)

            print(f"議案審議経過情報ページからデータ取得中...")
            self.scrape_progress_info(progress_page_paths, session)

            print(f"法案ページからデータ取得中...")

            print(f"要綱ページからデータ取得中...")
        except Exception as e:
            print(f"❌ スクレイピングに失敗: {e}")

    def scrape_bill_list(self, session: str) -> Tuple[List[str], List[str]]:
        """議案一覧をスクレイピング"""

        print(f"議案一覧ページからデータ取得中...")
        url = f"https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/kaiji{session}.htm"
        soup = self.get_page_content(url)
        parser = BillListParser(soup.encode())
        bill_table = parser.parse()
        # データ登録
        DietSessionDao.save_bills(bill_table, session)

        progress_page_paths = [row[4] for row in bill_table]
        content_page_paths = [row[5] for row in bill_table]

        return progress_page_paths, content_page_paths

    def test(self, session: str):
        url = "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/g21505001.htm"
        soup = self.get_page_content(url)
        # print(soup)
        # parser = BillProgressParser(str(soup))
        # bill_progress_table = parser.parse()
        # print(bill_progress_table)
        # HTMLの内容を出力
        try:
            with open("result.html", "w", encoding="utf-8") as f:
                f.write(str(soup.prettify()))
            print("✅ HTMLの出力に成功しました")
        except Exception as e:
            print(f"❌ HTMLの出力に失敗: {e}")

    def scrape_progress_info(self, progress_page_paths: List[str], session: str):
        """議案審議経過情報をスクレイピング"""

        # URL
        base_url = f"https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/"

        # 各URLに対して処理
        for temp_path in progress_page_paths:
            path = temp_path[2:]
            # 完全なURLを作成
            url = base_url + path
            print(url)
            time.sleep(2)  # 2秒間の間隔を設ける
            soup = self.get_page_content(url)
            parser = BillProgressParser(soup.encode())
            bill_progress_table = parser.parse()
            BillProgressDao.save(bill_progress_table, session)

    def _scrape_bill_detail_requests(self, url: str, session) -> Optional[Dict]:
        """requestsを使用した議案詳細の取得"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, "html.parser")
            return self._extract_bill_data(soup, url, session)

        except Exception as e:
            print(f"   ❌ requests詳細取得エラー: {e}")
            return None

    def _extract_bill_data(
        self, soup: BeautifulSoup, url: str, session
    ) -> Optional[Dict]:
        """HTMLから議案データを抽出"""
        try:
            print("HTMLから議案データを抽出")
            # 議案番号を取得
            # bill_number = self._extract_bill_number(soup)
            # print(f"bill_number:  {bill_number}")

            # タイトルを取得
            bill_table = self._extract_bill_table(soup, session)
            # print(f"テーブル情報:  {bill_table}")

            return {"table_data": bill_table, "source_url": url}

        except Exception as e:
            print(f"   ❌ データ抽出エラー: {e}")
            return None

    def _extract_title(self, soup: BeautifulSoup) -> List[str]:
        """タイトルを抽出"""
        titles = []
        # 表の3列目から議案件名を取得
        table = soup.find("table", class_="table")
        if table:
            rows = table.find_all("tr")
            if len(rows) > 1:  # ヘッダー行を除く
                # データ行を全て取得
                for row in rows[1:]:  # ヘッダー行をスキップ
                    columns = row.find_all("td")
                    if len(columns) >= 3:
                        title_span = columns[2].find("span", class_="txt03")
                        if title_span:
                            title = title_span.get_text().strip()
                            if title:  # 空でない場合のみ追加
                                titles.append(title)
        return titles if titles else ["タイトル不明"]

    def _extract_table_data(self, soup: BeautifulSoup) -> Dict[str, str]:
        """テーブルデータを抽出"""
        data = {}

        for table in soup.find_all("table"):
            for row in table.find_all("tr"):
                cells = row.find_all(["td", "th"])
                if len(cells) >= 2:
                    key = cells[0].get_text().strip()
                    value = cells[1].get_text().strip()
                    if key and value:
                        data[key] = value

        return data

    def _extract_bill_table(self, soup: BeautifulSoup, session) -> List[List[str]]:
        """議案一覧表の全データを2次元配列で取得"""
        table_data = []

        # 表を取得
        table = soup.find("table", class_="table")
        if not table:
            return table_data

        # ヘッダー行を取得
        headers = []
        header_row = table.find("tr")
        if header_row:
            for th in header_row.find_all("th"):
                header_text = th.find("span", class_="txt03")
                if header_text:
                    headers.append(header_text.get_text().strip())

        # データ行を取得
        for row in table.find_all("tr")[1:]:  # ヘッダー行をスキップ
            row_data = []
            for td in row.find_all("td"):
                # リンクがある場合はリンクのURLを取得
                link = td.find("a")
                if link and "href" in link.attrs:
                    row_data.append(link["href"])
                else:
                    # 通常のテキストを取得
                    span = td.find("span", class_="txt03")
                    if span:
                        row_data.append(span.get_text().strip())
                    else:
                        row_data.append("")

            if row_data:  # 空でない場合のみ追加
                table_data.append(row_data)

        # 整形して出力
        if table_data:
            print("\n📋 議案一覧:")
            print("=" * 120)
            print(
                f"{'提出回次':<8} {'番号':<6} {'議案件名':<50} {'審議状況':<12} {'経過情報':<20} {'本文情報':<20}"
            )
            print("-" * 120)
            for row in table_data:
                # 議案件名が長い場合は省略
                title = row[2]
                if len(title) > 45:
                    title = title[:42] + "..."
                print(
                    f"{row[0]:<8} {row[1]:<6} {title:<50} {row[3]:<12} {row[4]:<20} {row[5]:<20}"
                )
            print("=" * 120)
            print(f"合計: {len(table_data)}件\n")

        return table_data

    def _find_in_table_data(
        self, data: Dict[str, str], keys: List[str]
    ) -> Optional[str]:
        """テーブルデータから該当する項目を検索"""
        for key in keys:
            for data_key in data.keys():
                if key in data_key:
                    return data[data_key]
        return None
