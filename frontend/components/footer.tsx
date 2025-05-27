import Link from "next/link"

export default function Footer() {
  return (
    <footer className="politics-dot-watch-footer py-8">
      <div className="politics-dot-watch-container">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="md:max-w-xs">
            <h3 className="text-base font-bold mb-4 flex items-center">
              <span className="text-primary">政治</span>ドットウォッチ
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              国民が法案の内容を正確に把握し、意見を表明できるプラットフォーム
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-600 hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-bold mb-4">コンテンツ</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link href="/bills" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    法案検索
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    よくある質問
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4">カテゴリー</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/bills?category=economy"
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    経済
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bills?category=welfare"
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    福祉
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bills?category=education"
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    教育
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bills?category=environment"
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    環境
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-4">法的情報</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-primary transition-colors">
                    お問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} 政治ドットウォッチ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
