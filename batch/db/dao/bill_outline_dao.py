from datetime import datetime
from typing import Dict, Union
import psycopg2
from psycopg2.extras import execute_values

from db.base import DatabaseConnection


class BillOutlineDao:
    """要綱のデータベースアクセスオブジェクト"""

    @staticmethod
    def save(
        outline_data: Dict[str, Union[str, int]], submit_session: int, number: int
    ) -> None:
        """スクレイピングした要綱をデータベースに保存"""
        try:
            # データベースに接続
            with DatabaseConnection.get_connection() as conn:
                with conn.cursor() as cur:
                    # 現在時刻を取得
                    current_time = datetime.now()

                    # 複合キーで既存データを確認
                    cur.execute(
                        """
                        SELECT COUNT(*) FROM "BillOutline"
                        WHERE "submitSession" = %s AND number = %s
                    """,
                        (submit_session, number),
                    )

                    if cur.fetchone()[0] == 0:
                        # データが存在しない場合のみ追加
                        insert_query = """
                            INSERT INTO "BillOutline" (
                                "submitSession", number, outline,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s
                            )
                        """

                        # データを整形
                        values = (
                            submit_session,
                            number,
                            outline_data.get("要綱"),
                            current_time,  # createdAt
                            current_time,  # updatedAt
                        )

                        cur.execute(insert_query, values)
                        conn.commit()
                        print(f"✅ 要綱をデータベースに保存しました")
                    else:
                        print(f"ℹ️ 既存の要綱が存在するため、スキップしました")

        except Exception as e:
            print(f"❌ データベース保存エラー: {e}")
            raise
