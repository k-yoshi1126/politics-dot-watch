import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime
from typing import List, Dict

from db.dao.bill_content_info_url_dao import BillContentInfoUrlDao


@pytest.fixture
def sample_content_info_list() -> List[Dict[str, str]]:
    """テスト用のサンプルデータを提供するフィクスチャ"""
    return [
        {"テキスト": "議案本文", "URL": "https://example.com/bill1"},
        {"テキスト": "参考資料", "URL": "https://example.com/ref1"},
        {"テキスト": "修正案", "URL": "https://example.com/amend1"},
    ]


@pytest.fixture
def mock_db_connection():
    """データベース接続のモックを提供するフィクスチャ"""
    with patch(
        "db.dao.bill_content_info_url_dao.DatabaseConnection.get_connection"
    ) as mock:
        # モックの接続オブジェクトを作成
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.__enter__.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
        mock.return_value = mock_conn
        yield mock_conn, mock_cursor


class TestBillContentInfoUrlDao:
    """BillContentInfoUrlDaoのテストクラス"""

    def test_save_new_data(self, mock_db_connection, sample_content_info_list):
        """新規データの保存テスト"""
        mock_conn, mock_cursor = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)  # 既存データなし

        # テスト実行
        result = BillContentInfoUrlDao.save(sample_content_info_list, 1, 1)

        # 検証
        assert len(result) == len(sample_content_info_list)
        assert result == sample_content_info_list
        # SELECT + INSERTの呼び出し回数を検証
        assert mock_cursor.execute.call_count == len(sample_content_info_list) * 2
        mock_conn.commit.assert_called()

    def test_save_existing_data(self, mock_db_connection, sample_content_info_list):
        """既存データのスキップテスト"""
        mock_conn, mock_cursor = mock_db_connection
        # 最初のデータは既存、残りは新規
        mock_cursor.fetchone.side_effect = [(1,), (0,), (0,)]

        # テスト実行
        result = BillContentInfoUrlDao.save(sample_content_info_list, 1, 1)

        # 検証
        assert len(result) == 2  # 新規データのみ
        assert result == sample_content_info_list[1:]  # 既存データを除いた結果
        # SELECTの呼び出し回数 + 新規データのINSERT呼び出し回数を検証
        assert mock_cursor.execute.call_count == len(sample_content_info_list) + 2
        mock_conn.commit.assert_called()

    def test_save_empty_list(self, mock_db_connection):
        """空リストの保存テスト"""
        mock_conn, mock_cursor = mock_db_connection

        # テスト実行
        result = BillContentInfoUrlDao.save([], 1, 1)

        # 検証
        assert result == []
        mock_cursor.execute.assert_not_called()
        mock_conn.commit.assert_not_called()

    def test_save_special_characters(self, mock_db_connection):
        """特殊文字を含むデータの保存テスト"""
        mock_conn, mock_cursor = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        special_data = [
            {
                "テキスト": "特殊文字テスト\n改行",
                "URL": "https://example.com/特殊文字?param=値&key=値",
            },
            {
                "テキスト": "日本語テスト",
                "URL": "https://example.com/日本語パス/ファイル.html",
            },
        ]

        # テスト実行
        result = BillContentInfoUrlDao.save(special_data, 1, 1)

        # 検証
        assert result == special_data
        assert mock_cursor.execute.call_count == len(special_data) * 2
        mock_conn.commit.assert_called()

    def test_save_long_text(self, mock_db_connection):
        """長いテキストの保存テスト"""
        mock_conn, mock_cursor = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        long_text = "a" * 10000  # 長いテキスト
        long_url = "https://example.com/" + "a" * 1000  # 長いURL
        long_data = [{"テキスト": long_text, "URL": long_url}]

        # テスト実行
        result = BillContentInfoUrlDao.save(long_data, 1, 1)

        # 検証
        assert result == long_data
        assert mock_cursor.execute.call_count == 2
        mock_conn.commit.assert_called()

    def test_database_connection_error(self, mock_db_connection):
        """データベース接続エラーのテスト"""
        mock_conn, mock_cursor = mock_db_connection
        mock_conn.__enter__.side_effect = Exception("データベース接続エラー")

        # テスト実行と検証
        with pytest.raises(Exception) as exc_info:
            BillContentInfoUrlDao.save(
                [{"テキスト": "テスト", "URL": "https://example.com"}], 1, 1
            )
        assert str(exc_info.value) == "データベース接続エラー"

    def test_sql_execution_error(self, mock_db_connection):
        """SQL実行エラーのテスト"""
        mock_conn, mock_cursor = mock_db_connection
        # 最初のSELECTは成功し、INSERTでエラーが発生するように設定
        mock_cursor.fetchone.return_value = (0,)
        mock_cursor.execute.side_effect = [None, Exception("SQL実行エラー")]

        # テスト実行と検証
        with pytest.raises(Exception) as exc_info:
            BillContentInfoUrlDao.save(
                [{"テキスト": "テスト", "URL": "https://example.com"}], 1, 1
            )
        assert str(exc_info.value) == "SQL実行エラー"
        mock_conn.rollback.assert_called()  # ロールバックが呼ばれることを確認
