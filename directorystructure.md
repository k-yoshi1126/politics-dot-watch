# プロジェクトディレクトリ構造

```
politics-dot-watch/
├── .cursor/                 # Cursor IDEの設定ファイル
├── .git/                    # Gitリポジトリの設定ファイル
├── .github/                 # GitHub関連の設定ファイル
├── .pytest_cache/          # Pythonテストのキャッシュ
├── batch/                  # バッチ処理関連のスクリプト
│   ├── db/                # データベース関連の処理
│   ├── display/           # データ表示関連の処理
│   ├── parsers/           # データパース処理
│   ├── scraper/           # スクレイピング処理
│   ├── tests/             # テストコード
│   ├── main.py            # メイン処理
│   ├── common.py          # 共通ユーティリティ
│   ├── run_scraper.py     # スクレイパー実行スクリプト
│   └── requirements.txt    # Python依存関係
├── docker/                 # Docker関連の設定ファイル
├── frontend/               # フロントエンドアプリケーション
│   ├── .next/             # Next.jsのビルド出力
│   ├── app/               # Next.jsのアプリケーションコード
│   ├── batch/             # フロントエンド用バッチ処理
│   ├── components/        # Reactコンポーネント
│   ├── hooks/             # カスタムReactフック
│   ├── lib/               # ユーティリティ関数やライブラリ
│   ├── pages/             # Next.jsのページコンポーネント
│   ├── prisma/            # Prismaのスキーマと設定
│   ├── public/            # 静的ファイル
│   ├── scripts/           # ビルドスクリプトなど
│   └── types/             # TypeScript型定義
├── docker-compose.yml      # 本番環境用Docker Compose設定
├── docker-compose.dev.yml  # 開発環境用Docker Compose設定
└── .gitignore             # Gitの除外設定
