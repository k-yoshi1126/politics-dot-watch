import pytest
from unittest.mock import patch, MagicMock, call
from datetime import datetime
from db.dao.bill_outline_dao import BillOutlineDao


class TestBillOutlineDao:
    """BillOutlineDaoのテストクラス"""

    @pytest.fixture
    def sample_outline_data(self):
        """テスト用サンプル要綱データ"""
        return {
            "要綱": "この法律案は、デジタル社会の形成を図るため、デジタル庁を設置し、デジタル社会形成基本法を制定するものである。"
        }

    @pytest.fixture
    def sample_submit_session(self):
        """テスト用提出回次"""
        return 208

    @pytest.fixture
    def sample_number(self):
        """テスト用議案番号"""
        return 15

    @pytest.fixture
    def mock_db_connection(self):
        """データベース接続のモック"""
        with patch("db.dao.bill_outline_dao.DatabaseConnection") as mock_db:
            mock_cursor = MagicMock()
            mock_conn = MagicMock()
            mock_db.get_connection.return_value.__enter__.return_value = mock_conn
            mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
            yield mock_cursor, mock_conn

    @pytest.fixture
    def mock_datetime(self):
        """日時のモック"""
        with patch("db.dao.bill_outline_dao.datetime") as mock_dt:
            mock_dt.now.return_value = datetime(2024, 1, 1, 12, 0, 0)
            yield mock_dt

    def test_save_new_outline(
        self,
        mock_db_connection,
        mock_datetime,
        sample_outline_data,
        sample_submit_session,
        sample_number,
        capsys,
    ):
        """新規要綱の保存テスト"""
        mock_cursor, mock_conn = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        select_sql = """
                        SELECT COUNT(*) FROM "BillOutline"
                        WHERE "submitSession" = %s AND number = %s
                    """
        insert_sql = """
                            INSERT INTO "BillOutline" (
                                "submitSession", number, outline,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s
                            )
                        """
        BillOutlineDao.save(sample_outline_data, sample_submit_session, sample_number)
        mock_cursor.execute.assert_has_calls(
            [
                call(select_sql, (sample_submit_session, sample_number)),
                call(
                    insert_sql,
                    (
                        sample_submit_session,
                        sample_number,
                        sample_outline_data.get("要綱"),
                        datetime(2024, 1, 1, 12, 0, 0),
                        datetime(2024, 1, 1, 12, 0, 0),
                    ),
                ),
            ]
        )
        mock_conn.commit.assert_called_once()
        out = capsys.readouterr().out
        assert "✅ 要綱をデータベースに保存しました" in out

    def test_skip_existing_outline(
        self,
        mock_db_connection,
        mock_datetime,
        sample_outline_data,
        sample_submit_session,
        sample_number,
        capsys,
    ):
        """既存要綱のスキップテスト"""
        mock_cursor, mock_conn = mock_db_connection
        mock_cursor.fetchone.return_value = (1,)

        select_sql = """
                        SELECT COUNT(*) FROM "BillOutline"
                        WHERE "submitSession" = %s AND number = %s
                    """
        BillOutlineDao.save(sample_outline_data, sample_submit_session, sample_number)
        mock_cursor.execute.assert_called_once_with(
            select_sql, (sample_submit_session, sample_number)
        )
        mock_conn.commit.assert_not_called()
        out = capsys.readouterr().out
        assert "既存の要綱が存在するため、スキップしました" in out

    @pytest.mark.parametrize(
        "outline_data,submit_session,number,should_save",
        [
            ({"要綱": "テスト要綱1"}, 208, 15, True),  # 新規データ
            ({}, 208, 16, False),  # 空辞書
            ({"要綱": None}, 208, 17, True),  # None値
            ({"要綱": "特殊文字テスト: 「」『』©®"}, 208, 18, True),  # 特殊文字
        ],
    )
    def test_various_outline_data(
        self,
        mock_db_connection,
        mock_datetime,
        outline_data,
        submit_session,
        number,
        should_save,
        capsys,
    ):
        """様々な要綱データのテスト"""
        mock_cursor, mock_conn = mock_db_connection
        mock_cursor.fetchone.return_value = (0,)

        select_sql = """
                        SELECT COUNT(*) FROM "BillOutline"
                        WHERE "submitSession" = %s AND number = %s
                    """
        insert_sql = """
                            INSERT INTO "BillOutline" (
                                "submitSession", number, outline,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s
                            )
                        """
        BillOutlineDao.save(outline_data, submit_session, number)
        if should_save:
            mock_cursor.execute.assert_has_calls(
                [
                    call(select_sql, (submit_session, number)),
                    call(
                        insert_sql,
                        (
                            submit_session,
                            number,
                            outline_data.get("要綱"),
                            datetime(2024, 1, 1, 12, 0, 0),
                            datetime(2024, 1, 1, 12, 0, 0),
                        ),
                    ),
                ]
            )
            mock_conn.commit.assert_called_once()
            out = capsys.readouterr().out
            assert "✅ 要綱をデータベースに保存しました" in out
        else:
            # 空辞書の場合はデータベースクエリが実行されないことを確認
            mock_cursor.execute.assert_not_called()
            mock_conn.commit.assert_not_called()
            out = capsys.readouterr().out
            assert "ℹ️ 要綱データが空のため、スキップしました" in out

    def test_database_connection_error(
        self, sample_outline_data, sample_submit_session, sample_number
    ):
        """データベース接続エラーのテスト"""
        with patch("db.dao.bill_outline_dao.DatabaseConnection") as mock_db:
            mock_db.get_connection.side_effect = Exception("データベース接続エラー")

            # テスト実行
            with pytest.raises(Exception) as excinfo:
                BillOutlineDao.save(
                    sample_outline_data, sample_submit_session, sample_number
                )
            assert "データベース接続エラー" in str(excinfo.value)

    def test_sql_execution_error(
        self,
        mock_db_connection,
        mock_datetime,
        sample_outline_data,
        sample_submit_session,
        sample_number,
    ):
        """SQL実行エラーのテスト"""
        mock_cursor, mock_conn = mock_db_connection
        mock_cursor.execute.side_effect = Exception("SQL実行エラー")

        # テスト実行
        with pytest.raises(Exception) as excinfo:
            BillOutlineDao.save(
                sample_outline_data, sample_submit_session, sample_number
            )
        assert "SQL実行エラー" in str(excinfo.value)
        mock_conn.commit.assert_not_called()

    def test_missing_outline_key(
        self,
        mock_db_connection,
        mock_datetime,
        sample_submit_session,
        sample_number,
        capsys,
    ):
        """要綱キーが存在しない場合のテスト"""
        mock_cursor, mock_conn = mock_db_connection
        outline_data = {"別のキー": "値"}

        # 既存データなしの状態をモック
        mock_cursor.fetchone.return_value = (0,)

        select_sql = """
                        SELECT COUNT(*) FROM "BillOutline"
                        WHERE "submitSession" = %s AND number = %s
                    """
        insert_sql = """
                            INSERT INTO "BillOutline" (
                                "submitSession", number, outline,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s
                            )
                        """
        BillOutlineDao.save(outline_data, sample_submit_session, sample_number)
        mock_cursor.execute.assert_has_calls(
            [
                call(select_sql, (sample_submit_session, sample_number)),
                call(
                    insert_sql,
                    (
                        sample_submit_session,
                        sample_number,
                        None,  # outline_data.get("要綱")はNoneを返す
                        datetime(2024, 1, 1, 12, 0, 0),
                        datetime(2024, 1, 1, 12, 0, 0),
                    ),
                ),
            ]
        )
        mock_conn.commit.assert_called_once()
        out = capsys.readouterr().out
        assert "✅ 要綱をデータベースに保存しました" in out

    def test_long_outline_text(
        self,
        mock_db_connection,
        mock_datetime,
        sample_submit_session,
        sample_number,
        capsys,
    ):
        """長文要綱のテスト"""
        mock_cursor, mock_conn = mock_db_connection
        long_text = "テスト" * 1000  # 4000文字の長文
        outline_data = {"要綱": long_text}

        # 既存データなしの状態をモック
        mock_cursor.fetchone.return_value = (0,)

        select_sql = """
                        SELECT COUNT(*) FROM "BillOutline"
                        WHERE "submitSession" = %s AND number = %s
                    """
        insert_sql = """
                            INSERT INTO "BillOutline" (
                                "submitSession", number, outline,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s
                            )
                        """
        BillOutlineDao.save(outline_data, sample_submit_session, sample_number)
        mock_cursor.execute.assert_has_calls(
            [
                call(select_sql, (sample_submit_session, sample_number)),
                call(
                    insert_sql,
                    (
                        sample_submit_session,
                        sample_number,
                        long_text,
                        datetime(2024, 1, 1, 12, 0, 0),
                        datetime(2024, 1, 1, 12, 0, 0),
                    ),
                ),
            ]
        )
        mock_conn.commit.assert_called_once()
        out = capsys.readouterr().out
        assert "✅ 要綱をデータベースに保存しました" in out
