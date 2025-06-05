import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from typing import List, Dict

from db.dao.diet_session_dao import DietSessionDao


@pytest.fixture
def sample_table_data() -> List[List[str]]:
    """テスト用のサンプルデータを提供するフィクスチャ"""
    return [
        [
            "1",
            "200",
            "議案番号1",
            "議案タイトル1",
            "審議中",
            "progress_url1",
            "content_url1",
        ],
        [
            "1",
            "201",
            "議案番号2",
            "議案タイトル2",
            "可決",
            "progress_url2",
            "content_url2",
        ],
        [
            "2",
            "200",
            "議案番号3",
            "議案タイトル3",
            "否決",
            "progress_url3",
            "content_url3",
        ],
    ]


@pytest.fixture
def mock_db_connection():
    """データベース接続のモックを提供するフィクスチャ"""
    with patch(
        "db.dao.diet_session_dao.DatabaseConnection.get_connection"
    ) as mock_conn, patch(
        "db.dao.diet_session_dao.execute_values"
    ) as mock_execute_values:
        # モックの接続オブジェクトを作成
        mock_conn_obj = MagicMock()
        mock_cursor = MagicMock()
        mock_conn_obj.__enter__.return_value = mock_conn_obj
        mock_conn_obj.cursor.return_value.__enter__.return_value = mock_cursor
        mock_conn.return_value = mock_conn_obj
        yield mock_conn_obj, mock_cursor, mock_execute_values


@pytest.fixture
def mock_datetime():
    """日時のモックを提供するフィクスチャ"""
    with patch("db.dao.diet_session_dao.datetime") as mock:
        mock.now.return_value = datetime(2024, 1, 1, 12, 0, 0)
        yield mock


class TestDietSessionDao:
    """DietSessionDaoのテストクラス"""

    def test_save_new_data(
        self, mock_db_connection, sample_table_data, mock_datetime, capfd
    ):
        """新規データの一括保存テスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)  # 既存データなし

        # テスト実行
        DietSessionDao.save(sample_table_data, "210")

        # 検証
        assert mock_cursor.execute.call_count == len(
            sample_table_data
        )  # SELECTの呼び出し回数
        assert mock_execute_values.call_count == 1  # 一括挿入の呼び出し回数
        mock_conn.commit.assert_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        assert (
            f"✅ {len(sample_table_data)}件のデータをデータベースに保存しました"
            in captured.out
        )
        assert "ℹ️ 0件の既存データをスキップしました" not in captured.out

    def test_save_existing_data(
        self, mock_db_connection, sample_table_data, mock_datetime, capfd
    ):
        """既存データのスキップテスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        # 最初のデータは既存、残りは新規
        mock_cursor.fetchone.side_effect = [(1,), (0,), (0,)]

        # テスト実行
        DietSessionDao.save(sample_table_data, "210")

        # 検証
        assert mock_cursor.execute.call_count == len(
            sample_table_data
        )  # SELECTの呼び出し回数
        assert mock_execute_values.call_count == 1  # 一括挿入の呼び出し回数
        mock_conn.commit.assert_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        assert "✅ 2件のデータをデータベースに保存しました" in captured.out
        assert "ℹ️ 1件の既存データをスキップしました" in captured.out

    def test_save_all_existing_data(
        self, mock_db_connection, sample_table_data, mock_datetime, capfd
    ):
        """全て既存データの場合のテスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (1,)  # 全て既存データ

        # テスト実行
        DietSessionDao.save(sample_table_data, "210")

        # 検証
        assert mock_cursor.execute.call_count == len(
            sample_table_data
        )  # SELECTの呼び出し回数
        assert mock_execute_values.call_count == 0  # 一括挿入なし
        mock_conn.commit.assert_not_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        assert (
            f"ℹ️ {len(sample_table_data)}件の既存データをスキップしました"
            in captured.out
        )

    def test_save_empty_list(self, mock_db_connection, mock_datetime, capfd):
        """空リストの保存テスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection

        # テスト実行
        DietSessionDao.save([], "210")

        # 検証
        mock_cursor.execute.assert_not_called()
        mock_execute_values.assert_not_called()
        mock_conn.commit.assert_not_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        assert "✅ 0件のデータをデータベースに保存しました" not in captured.out
        assert "ℹ️ 0件の既存データをスキップしました" not in captured.out

    def test_save_special_characters(self, mock_db_connection, mock_datetime, capfd):
        """特殊文字を含むデータの保存テスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        special_data = [
            [
                "1",
                "200",
                "議案番号1",
                "特殊文字テスト\n改行",
                "審議中",
                "https://example.com/特殊文字?param=値",
                "https://example.com/日本語パス/ファイル.html",
            ]
        ]

        # テスト実行
        DietSessionDao.save(special_data, "210")

        # 検証
        assert mock_cursor.execute.call_count == 1
        assert mock_execute_values.call_count == 1
        mock_conn.commit.assert_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        assert "✅ 1件のデータをデータベースに保存しました" in captured.out

    def test_save_large_data(self, mock_db_connection, mock_datetime, capfd):
        """大量データの保存テスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        # 1000件のテストデータを生成
        large_data = [
            [
                "1",
                str(i),
                f"議案番号{i}",
                f"議案タイトル{i}",
                "審議中",
                f"progress_url{i}",
                f"content_url{i}",
            ]
            for i in range(1000)
        ]

        # テスト実行
        DietSessionDao.save(large_data, "210")

        # 検証
        assert mock_cursor.execute.call_count == 1000  # SELECTの呼び出し回数
        assert mock_execute_values.call_count == 1  # 一括挿入の呼び出し回数
        mock_conn.commit.assert_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        assert "✅ 1000件のデータをデータベースに保存しました" in captured.out

    def test_database_connection_error(self, mock_db_connection):
        """データベース接続エラーのテスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_conn.__enter__.side_effect = Exception("データベース接続エラー")

        # テスト実行と検証
        with pytest.raises(Exception) as exc_info:
            DietSessionDao.save(
                [["1", "200", "議案番号1", "議案タイトル1", "審議中", "url1", "url2"]],
                "210",
            )
        assert str(exc_info.value) == "データベース接続エラー"

    def test_sql_execution_error(self, mock_db_connection):
        """SQL実行エラーのテスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)
        mock_cursor.execute.side_effect = Exception("SQL実行エラー")

        # テスト実行と検証
        with pytest.raises(Exception) as exc_info:
            DietSessionDao.save(
                [["1", "200", "議案番号1", "議案タイトル1", "審議中", "url1", "url2"]],
                "210",
            )
        assert str(exc_info.value) == "SQL実行エラー"
        mock_conn.rollback.assert_called()

    def test_data_type_conversion_error(self, mock_db_connection):
        """データ型変換エラーのテスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        # 不正なデータ（数値に変換できない文字列）
        invalid_data = [
            ["invalid", "200", "議案番号1", "議案タイトル1", "審議中", "url1", "url2"]
        ]

        # テスト実行と検証
        with pytest.raises(ValueError) as exc_info:
            DietSessionDao.save(invalid_data, "210")
        assert "invalid literal for int()" in str(exc_info.value)
        mock_conn.rollback.assert_called()

    @pytest.mark.parametrize(
        "table_data,session,expected_insert_count",
        [
            (
                [["1", "200", "議案番号1", "議案タイトル1", "審議中", "url1", "url2"]],
                "210",
                1,
            ),  # 単一データ
            ([], "210", 0),  # 空データ
            (
                [
                    [
                        "1",
                        "200",
                        "議案番号1",
                        "議案タイトル1",
                        "審議中",
                        "url1",
                        "url2",
                    ],
                    ["1", "201", "議案番号2", "議案タイトル2", "可決", "url2", "url3"],
                ],
                "210",
                2,
            ),  # 複数データ
        ],
    )
    def test_save_parameterized(
        self, mock_db_connection, table_data, session, expected_insert_count, capfd
    ):
        """パラメータ化テスト"""
        mock_conn, mock_cursor, mock_execute_values = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        # テスト実行
        DietSessionDao.save(table_data, session)

        # 検証
        assert mock_cursor.execute.call_count == len(table_data)
        assert mock_execute_values.call_count == (1 if expected_insert_count > 0 else 0)
        if expected_insert_count > 0:
            mock_conn.commit.assert_called()
        else:
            mock_conn.commit.assert_not_called()

        # コンソール出力の検証
        captured = capfd.readouterr()
        if expected_insert_count > 0:
            assert (
                f"✅ {expected_insert_count}件のデータをデータベースに保存しました"
                in captured.out
            )
        else:
            assert "✅ 0件のデータをデータベースに保存しました" not in captured.out
