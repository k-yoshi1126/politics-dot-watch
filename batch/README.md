# スクレイピング環境構築手順

## 環境構築

1. Pythonの仮想環境を作成
```bash
python -m venv venv
```

2. 仮想環境を有効化
```bash
# macOSの場合
source venv/bin/activate
```

3. 必要なパッケージをインストール
```bash
pip install -r requirements.txt
```

## 使用可能なパッケージ

- requests: HTTPリクエスト用
- beautifulsoup4: HTMLパース用
- selenium: 動的なWebページのスクレイピング用
- pandas: データ処理用
- python-dotenv: 環境変数管理用
- lxml: XML/HTMLパーサー

## 注意事項

- スクレイピングを行う際は、対象サイトの利用規約を確認してください
- 適切な間隔を空けてリクエストを送信してください
- 必要に応じてUser-Agentを設定してください 