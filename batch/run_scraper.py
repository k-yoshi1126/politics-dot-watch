"""
簡単実行用スクリプト
コマンドライン引数なしで実行可能
"""
import sys
from scraper.diet_scraper import DietScraper
from display.bill_displayer import BillDisplayer

def quick_run():
    """クイック実行"""
    print("🏛️ 衆議院議案情報スクレイピング（クイック実行）")
    print(f"📋 対象: 第{sys.argv[1]}回国会")
    
    scraper = DietScraper(headless=True, wait_time=1)
    displayer = BillDisplayer()
    
    try:
        bills = scraper.scrape_bill_info(sys.argv[1], 1)
            
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
    finally:
        scraper.close_driver()

if __name__ == "__main__":
    quick_run()