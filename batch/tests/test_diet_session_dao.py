import pytest
from unittest.mock import Mock, patch

from db.dao.diet_session_dao import DietSessionDao


@pytest.fixture
def mock_db_connection():
    with patch("db.dao.diet_session_dao.DatabaseConnection") as mock_db, patch(
        "db.dao.diet_session_dao.execute_values"
    ) as mock_execute_values:
        mock_cursor = Mock()
        mock_connection = Mock()
        mock_connection.encoding = "utf-8"
        mock_cursor.connection = mock_connection
        mock_db.get_connection.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = (
            mock_cursor
        )
        mock_execute_values.return_value = None
        yield mock_cursor, mock_execute_values


def test_save_new_data(mock_db_connection, capfd):
    mock_cursor, mock_execute_values = mock_db_connection
    mock_cursor.fetchone.return_value = [0]

    table_data = [
        [
            "1",
            "1",
            "法案タイトル1",
            "衆議院で閉会中審査",
            "/keika/1DC6AAA.htm",
            "/honbun/g19505002.htm",
        ],
        [
            "1",
            "2",
            "法案タイトル2",
            "成立",
            "/keika/1DC6AC6.htm",
            "/honbun/g19505004.htm",
        ],
    ]
    session = "202"

    DietSessionDao.save(table_data, session)

    assert mock_cursor.execute.call_count == 2  # 既存チェックの呼び出し回数
    assert mock_execute_values.call_count == 1  # データ挿入の呼び出し回数

    captured = capfd.readouterr()
    assert "✅ 2件のデータをデータベースに保存しました" in captured.out
    assert "ℹ️ 0件の既存データをスキップしました" not in captured.out


def test_save_duplicate_data(mock_db_connection, capfd):
    mock_cursor, mock_execute_values = mock_db_connection
    mock_cursor.fetchone.side_effect = [[1], [0]]

    table_data = [
        [
            "1",
            "1",
            "法案タイトル1",
            "衆議院で閉会中審査",
            "/keika/1DC6AAA.htm",
            "/honbun/g19505002.htm",
        ],
        [
            "1",
            "2",
            "法案タイトル2",
            "成立",
            "/keika/1DC6AC6.htm",
            "/honbun/g19505004.htm",
        ],
    ]
    session = "202"

    DietSessionDao.save(table_data, session)

    assert mock_cursor.execute.call_count == 2  # 既存チェックの呼び出し回数
    assert mock_execute_values.call_count == 1  # データ挿入の呼び出し回数

    captured = capfd.readouterr()
    assert "✅ 1件のデータをデータベースに保存しました" in captured.out
    assert "ℹ️ 1件の既存データをスキップしました" in captured.out


def test_save_all_duplicate_data(mock_db_connection, capfd):
    mock_cursor, mock_execute_values = mock_db_connection
    mock_cursor.fetchone.return_value = [1]

    table_data = [
        [
            "1",
            "1",
            "法案タイトル1",
            "衆議院で閉会中審査",
            "/keika/1DC6AAA.htm",
            "/honbun/g19505002.htm",
        ],
        [
            "1",
            "2",
            "法案タイトル2",
            "成立",
            "/keika/1DC6AC6.htm",
            "/honbun/g19505004.htm",
        ],
    ]
    session = "202"

    DietSessionDao.save(table_data, session)

    assert mock_cursor.execute.call_count == 2  # 既存チェックの呼び出し回数
    assert mock_execute_values.call_count == 0  # データ挿入なし

    captured = capfd.readouterr()
    assert "ℹ️ 2件の既存データをスキップしました" in captured.out


def test_save_database_error(mock_db_connection):
    mock_cursor, mock_execute_values = mock_db_connection
    mock_cursor.execute.side_effect = Exception("Database error")

    table_data = [
        [
            "1",
            "1",
            "法案タイトル1",
            "衆議院で閉会中審査",
            "/keika/1DC6AAA.htm",
            "/honbun/g19505002.htm",
        ]
    ]
    session = "202"

    with pytest.raises(Exception) as exc_info:
        DietSessionDao.save(table_data, session)

    assert str(exc_info.value) == "Database error"
