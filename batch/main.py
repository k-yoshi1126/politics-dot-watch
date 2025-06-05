from datetime import datetime
import argparse
from rich.console import Console
from rich.table import Table
from scraper.diet_scraper import DietScraper
from display.bill_displayer import BillDisplayer


def main():
    """メイン実行関数"""
    parser = argparse.ArgumentParser(description="衆議院議案情報スクレイピングツール")
    parser.add_argument(
        "--session", "-s", default="213", help="国会回次 (デフォルト: 213)"
    )
    parser.add_argument(
        "--max-bills", "-m", type=int, default=5, help="取得最大件数 (デフォルト: 5)"
    )
    parser.add_argument(
        "--headless", action="store_true", help="ヘッドレスモードで実行"
    )
    parser.add_argument(
        "--wait", "-w", type=int, default=2, help="リクエスト間隔(秒) (デフォルト: 2)"
    )

    args = parser.parse_args()

    print("🏛️ 衆議院議案情報スクレイピング開始")
    print(f"📋 対象: 第{args.session}回国会")
    print(f"🔢 取得予定件数: {args.max_bills}件")
    print(f"⏱️ リクエスト間隔: {args.wait}秒\n")

    scraper = DietScraper(headless=args.headless, wait_time=args.wait)
    displayer = BillDisplayer()

    try:
        bills = scraper.scrape_bill_info(args.session, args.max_bills)

        if bills:
            displayer.display_bills(bills)
            displayer.display_summary(bills)
        else:
            print("❌ 議案情報を取得できませんでした")

    except KeyboardInterrupt:
        print("\n⚠️ ユーザーによって中断されました")
    except Exception as e:
        print(f"❌ スクレイピング実行中にエラーが発生しました: {e}")
    finally:
        scraper.close_driver()


if __name__ == "__main__":
    main()
