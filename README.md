# 政治ドットウォッチ

国民が法案の内容を正確に把握し、意見を表明できる場を提供するWebサービスです。

法案情報は複雑かつ見づらいため、何が起きているのかを客観的かつ簡潔に整理し、進捗状況を含めて確認できるプラットフォームを構築します。

## 主な機能

- 国会提出法案の検索・閲覧
- 法案ごとの詳細ページ（進捗、概要など）
- （将来的に）コメント、いいね、SNSシェア機能
- スクレイピングによる法案情報の自動取得（Python）

## 技術スタック

技術スタックの詳細は [`technologystack.md`](./technologystack.md) を参照してください。

## 利用対象者

- **Webサイト利用者（一般ユーザー）**: デプロイされたサービスにアクセスすることで、法案情報を閲覧できます
- **開発者**: このリポジトリは開発者向けであり、Dockerを使ってローカルで起動できます
- **将来的に**: ネイティブアプリ（iOS/Android）の展開も予定しています

## セットアップ手順

### 前提条件

- Docker
- Docker Compose

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd politics-dot-watch
```

### 2. 環境変数の設定

各サービスに必要な環境変数ファイルを作成します。このプロジェクトでは、各サービスが独立した環境変数ファイルを持つことで、セキュリティと保守性を向上させています。

#### フロントエンド用環境変数

```bash
# 開発環境用
cp frontend/.env.example frontend/.env.local

# 本番環境用
cp frontend/.env.example frontend/.env
```

#### PostgreSQL用環境変数

```bash
# 開発環境用
cp docker/postgres/.env.example docker/postgres/.env.local

# 本番環境用
cp docker/postgres/.env.example docker/postgres/.env
```

#### MinIO用環境変数

```bash
# 開発環境用
cp docker/minio/.env.example docker/minio/.env.local

# 本番環境用
cp docker/minio/.env.example docker/minio/.env
```

#### Pythonバッチ処理用環境変数

```bash
# バッチ処理用（ローカル開発環境）
cp batch/.env.example batch/.env.local
```

> **注意**: Pythonバッチ処理は現在、システム環境変数または `.env.local` ファイルから環境変数を読み込みます。`python-dotenv` は依存関係に含まれていますが、現在は使用されていません。

各`.env`ファイルを編集して、必要な環境変数を設定してください。詳細な設定項目は各`.env.example`ファイルを参照してください。

> **重要**: frontendの環境変数ファイルの`NEXTAUTH_SECRET`は、実際のシークレットキーに変更してください。

### 3. Docker Composeでの起動

```bash
# 開発環境で起動
docker-compose -f docker-compose.dev.yml up -d

# または本番環境で起動
docker-compose up -d
```

### 4. Docker Composeでの停止

```bash
# 開発環境を停止
docker-compose -f docker-compose.dev.yml down

# または本番環境を停止
docker-compose down

# ボリュームも削除する場合（データが消去されます）
docker-compose down -v
```

### 5. データベースのセットアップ

#### 開発環境の場合

開発環境では、コンテナ起動時に `npx prisma generate` が自動実行されますが、マイグレーションは手動で実行する必要があります：

```bash
# フロントエンドコンテナ内でマイグレーションを実行
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# シードデータの投入（オプション）
docker-compose -f docker-compose.dev.yml exec app npx prisma db seed
```

#### 本番環境の場合

本番環境では、コンテナ起動時に自動でマイグレーションとシードが実行されます。

### 6. アクセス

- **フロントエンド**: http://localhost:3000
- **MinIO管理画面**: http://localhost:9001 (minioadmin/minioadmin)

## 開発環境構築（オプション）

### フロントエンド開発

```bash
# 開発環境でコンテナを起動
docker-compose -f docker-compose.dev.yml up -d
```

コンテナ起動時に自動で `npx prisma generate` が実行され、開発サーバーが起動します。

### Pythonバッチ処理の開発

```bash
cd batch

# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# 依存関係のインストール
pip install -r requirements.txt

# スクレイピングの実行
# 例: 第217回国会の情報をスクレイピング
python run_scraper.py 217
```

#### スクレイピングの注意事項

- スクレイピングを行う際は、対象サイトの利用規約を確認してください
- 適切な間隔を空けてリクエストを送信してください
- 必要に応じてUser-Agentを設定してください
- 大量のリクエストを送信する場合は、サーバーに負荷をかけないよう配慮してください 


## プロジェクト構造

プロジェクト構造の詳細は [`directorystructure.md`](./directorystructure.md) を参照してください。

## 開発ガイドライン

### フロントエンド開発

- **TypeScript**: 型安全性を確保
- **ESLint**: コード品質の管理
- **shadcn/ui**: アクセシブルなUIコンポーネント
- **Tailwind CSS**: ユーティリティファーストのスタイリング
- **Prisma**: 型安全なデータベース操作

### バッチ処理開発

- **pytest**: テスト駆動開発
- **SQLAlchemy**: ORMによるデータベース操作
- **Selenium**: 動的Webページのスクレイピング
- **BeautifulSoup4**: HTMLパース

### 開発フロー

1. **機能開発**: featureブランチを作成
2. **テスト**: 新機能には必ずテストを追加
3. **コードレビュー**: PRを作成してレビューを受ける
4. **マージ**: レビュー承認後にmainブランチにマージ

## トラブルシューティング

### よくある問題

1. **ポートが既に使用されている場合**
   ```bash
   # 使用中のポートを確認
   lsof -i :3000
   lsof -i :5432
   ```

2. **データベース接続エラー**
   ```bash
   # PostgreSQLコンテナの状態確認
   docker-compose ps
   
   # ログの確認
   docker-compose logs postgres
   ```

3. **MinIO接続エラー**
   ```bash
   # MinIOコンテナの状態確認
   docker-compose logs minio
   ```

## ライセンス

このプロジェクトのライセンス情報は後日追加予定です。

## 貢献

このプロジェクトへの貢献方法は後日追加予定です。

## 今後のロードマップ

- [ ] コメント機能の実装
- [ ] いいね機能の実装
- [ ] SNSシェア機能の実装
- [ ] ネイティブアプリ（iOS/Android）の開発
- [ ] より詳細な法案分析機能の追加 