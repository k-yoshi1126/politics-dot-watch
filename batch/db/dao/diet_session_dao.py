from datetime import datetime
from typing import List
from psycopg2.extras import execute_values

from db.base import DatabaseConnection


class DietSessionDao:
    """議案情報のデータベースアクセスオブジェクト"""

    @staticmethod
    def save(table_data: List[List[str]], session: str) -> None:
        """スクレイピングしたデータをデータベースに保存"""
        try:
            # データベースに接続
            with DatabaseConnection.get_connection() as conn:
                with conn.cursor() as cur:
                    # 現在時刻を取得
                    current_time = datetime.now()

                    # データを整形
                    values = []
                    skipped_count = 0

                    for row in table_data:
                        # 複合キーで既存データを確認
                        cur.execute(
                            """
                            SELECT COUNT(*) FROM "DietSessionInfo"
                            WHERE session = %s AND "submitSession" = %s AND number = %s
                        """,
                            (int(session), int(row[0]), int(row[1])),
                        )

                        if cur.fetchone()[0] == 0:
                            # データが存在しない場合のみ追加
                            values.append(
                                (
                                    int(session),  # session
                                    int(row[0]),  # submitSession
                                    int(row[1]),  # number
                                    row[2],  # title
                                    row[3],  # status
                                    row[4],  # progressUrl
                                    row[5],  # contentUrl
                                    current_time,  # createdAt
                                    current_time,  # updatedAt
                                )
                            )
                        else:
                            skipped_count += 1

                    if values:
                        # データを一括挿入
                        insert_query = """
                            INSERT INTO "DietSessionInfo" 
                            (session, "submitSession", number, title, status, "progressUrl", "contentUrl", "createdAt", "updatedAt")
                            VALUES %s
                        """
                        execute_values(cur, insert_query, values)
                        conn.commit()
                        print(f"✅ {len(values)}件のデータをデータベースに保存しました")

                    if skipped_count > 0:
                        print(f"ℹ️ {skipped_count}件の既存データをスキップしました")

        except Exception as e:
            print(f"❌ データベース保存エラー: {e}")
            if "conn" in locals():
                conn.rollback()
            raise
