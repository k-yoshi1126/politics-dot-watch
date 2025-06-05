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
from db.dao import (
    DietSessionDao,
    BillProgressDao,
    BillContentInfoUrlDao,
    BillSubmitContentDao,
    BillOutlineDao,
    BillProposedAmendmentDao,
)
from parsers.house_of_representative import (
    BillListParser,
    BillProgressParser,
    BillContentInfoListParser,
    SubmitContentParser,
    OutlineParser,
    AmendmentParser,
)


class DietScraper(BaseScraper):
    """衆議院議案情報スクレイピングクラス"""

    # ベースURL
    BASE_URL = "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian"
    BILL_LIST_URL = f"{BASE_URL}/kaiji{{}}.htm"  # 議案一覧
    BILL_DETAIL_URL = f"{BASE_URL}{{}}"  # 議案詳細
    BILL_CONTENT_URL = f"{BASE_URL}/honbun{{}}"  # 議案本文

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
            bill_list = self.scrape_bill_list(session)

            print(f"議案審議経過情報ページからデータ取得中...")
            self.scrape_progress_info(bill_list, session)

            print(f"議案本文情報一覧ページからデータ取得中...")
            self.scrape_content_info_list(bill_list)

            print(f"法案ページからデータ取得中...")

            print(f"要綱ページからデータ取得中...")
        except Exception as e:
            print(f"❌ スクレイピングに失敗: {e}")

    def scrape_bill_list(self, session: str) -> List[List[str]]:
        """議案一覧をスクレイピング"""
        print(f"議案一覧ページからデータ取得中...")
        url = self.BILL_LIST_URL.format(session)
        soup = self.get_page_content(url)
        parser = BillListParser(soup.encode())
        bill_list = parser.parse()
        DietSessionDao.save(bill_list, session)

        return bill_list

    def test(self, session: str):
        url = "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/youkou/g19505005.htm"
        soup = self.get_page_content(url)
        # parser = AmendmentParser(soup.encode())
        # amendment = parser.parse()
        # BillProposedAmendmentDao.save(amendment, 196, 42)
        # print(amendment)
        parser = OutlineParser(soup.encode())
        outline = parser.parse()
        print(outline)
        # HTMLの内容を出力
        try:
            with open("result.html", "w", encoding="utf-8") as f:
                f.write(str(soup.prettify()))
            print("✅ HTMLの出力に成功しました")
        except Exception as e:
            print(f"❌ HTMLの出力に失敗: {e}")

    def scrape_progress_info(self, bill_list: List[List[str]], session: str):
        """議案審議経過情報をスクレイピング"""
        for row in bill_list:
            url = self.BILL_DETAIL_URL.format(row[4])
            time.sleep(2)
            print(url)
            # HTMLを取得・パース
            soup = self.get_page_content(url)
            # パーサはバイト列を受け取る
            parser = BillProgressParser(soup.encode())
            bill_progress_table = parser.parse()
            BillProgressDao.save(bill_progress_table, session)

    def scrape_content_info_list(self, bill_list: List[List[str]]):
        """議案本文情報一覧をスクレイピング"""
        for row in bill_list:
            url = self.BILL_DETAIL_URL.format(row[5])
            time.sleep(2)
            print(url)
            soup = self.get_page_content(url)
            parser = BillContentInfoListParser(soup.encode())
            bill_content_info_list = parser.parse()
            # 新規データがある場合のみ処理を実行
            saved_items = BillContentInfoUrlDao.save(
                bill_content_info_list, int(row[0]), int(row[1])
            )
            if saved_items:
                self._process_saved_items(saved_items, int(row[0]), int(row[1]))

    def _process_saved_items(
        self, saved_items: List[Dict[str, str]], submit_session: int, number: int
    ):
        """保存されたデータに対して処理を行う

        Args:
            saved_items (List[Dict[str, str]]): 保存されたデータのリスト
            submit_session (int): 提出国会回次
            number (int): 番号
        """

        for item in saved_items:
            url = self.BILL_CONTENT_URL.format(item["URL"])
            soup = self.get_page_content(url)
            if item["テキスト"] == "提出時法律案":
                self._process_submit_content(soup, submit_session, number)
            elif item["テキスト"] == "[要綱]":
                self._process_outline(soup, submit_session, number)
            elif "修正案" in item["テキスト"]:
                self._process_amendment(soup, submit_session, number)
            else:
                print(f"リンクが未対応のテキストです: {item['テキスト']}")
                raise ValueError(f"リンクが未対応のテキストです: {item['テキスト']}")

    def _process_submit_content(
        self, soup: BeautifulSoup, submit_session: int, number: int
    ):
        """提出時法律案の処理"""
        parser = SubmitContentParser(soup.encode())
        submit_content = parser.parse()
        BillSubmitContentDao.save(submit_content, submit_session, number)

    def _process_outline(self, soup: BeautifulSoup, submit_session: int, number: int):
        """要綱の処理

        Args:
            soup (BeautifulSoup): URLから取得したデータ
            submit_session (int): 提出国会回次
            number (int): 番号
        """
        parser = OutlineParser(soup.encode())
        outline = parser.parse()
        BillOutlineDao.save(outline, submit_session, number)

    def _process_amendment(self, soup: BeautifulSoup, submit_session: int, number: int):
        """修正案の処理

        Args:
            soup (BeautifulSoup): URLから取得したデータ
            submit_session (int): 提出国会回次
            number (int): 番号
        """
        parser = AmendmentParser(soup.encode())
        amendment = parser.parse()
        BillProposedAmendmentDao.save(amendment, submit_session, number)
