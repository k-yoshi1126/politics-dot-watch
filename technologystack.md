# 技術スタック

## フロントエンド
- **フレームワーク**: Next.js 14.1.0
- **言語**: TypeScript
- **UIライブラリ**: 
  - React 18.2.0
  - Radix UI (コンポーネントライブラリ)
  - Tailwind CSS (スタイリング)
  - shadcn/ui (UIコンポーネント)
- **状態管理**: React Hooks
- **フォーム管理**: React Hook Form
- **認証**: NextAuth.js
- **データベース**: Prisma ORM
- **ストレージ**: MinIO (オブジェクトストレージ)

## バッチ処理
- **言語**: Python
- **スクレイピング**:
  - Selenium (ブラウザ自動化)
  - BeautifulSoup4 (HTMLパース)
  - requests (HTTP通信)
  - webdriver-manager (WebDriver管理)
- **データ処理**:
  - SQLAlchemy (ORM)
  - psycopg2-binary (PostgreSQL接続)
  - japanera (和暦処理)
  - jaconv (日本語文字変換)
  - kanjize (漢数字変換)
- **開発ツール**:
  - pytest (テストフレームワーク)
  - rich (コンソール出力)
  - colorama (コンソールカラー出力)
  - python-dotenv (環境変数管理)

## 開発ツール
- **パッケージマネージャー**: npm
- **ビルドツール**: Next.js
- **リンター**: ESLint
- **コンテナ化**: Docker
- **CI/CD**: GitHub Actions

## 主要な依存関係
- **UI/UX**:
  - @radix-ui/* (アクセシブルなUIコンポーネント)
  - lucide-react (アイコン)
  - recharts (グラフ)
  - sonner (トースト通知)
  - vaul (モバイルフレンドリーなUI)

- **認証/セキュリティ**:
  - bcryptjs (パスワードハッシュ化)
  - jsonwebtoken (JWT認証)
  - next-auth (認証フレームワーク)

- **データベース**:
  - @prisma/client
  - @next-auth/prisma-adapter

- **開発ツール**:
  - TypeScript
  - ESLint
  - PostCSS
  - Tailwind CSS
