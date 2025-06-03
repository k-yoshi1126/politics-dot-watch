from datetime import datetime
from typing import Dict, Union
import psycopg2
from psycopg2.extras import execute_values

from db.base import DatabaseConnection


class BillSubmitContentDao:
    """提出時法律案のデータベースアクセスオブジェクト"""

    @staticmethod
    def save(content_data: Dict[str, str], submit_session: int, number: int) -> None:
        """スクレイピングした提出時法律案をデータベースに保存"""
        try:
            # データベースに接続
            with DatabaseConnection.get_connection() as conn:
                with conn.cursor() as cur:
                    # 現在時刻を取得
                    current_time = datetime.now()

                    # 複合キーで既存データを確認
                    cur.execute(
                        """
                        SELECT COUNT(*) FROM "BillSubmitContent"
                        WHERE "submitSession" = %s AND number = %s
                    """,
                        (submit_session, number),
                    )

                    if cur.fetchone()[0] == 0:
                        # データが存在しない場合のみ追加
                        insert_query = """
                            INSERT INTO "BillSubmitContent" (
                                "submitSession", number, content,
                                "supplementaryProvisions", reason,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s
                            )
                        """

                        # データを整形
                        values = (
                            submit_session,
                            number,
                            content_data.get("提出時法案内容"),
                            content_data.get("附則"),
                            content_data.get("理由"),
                            current_time,  # createdAt
                            current_time,  # updatedAt
                        )

                        cur.execute(insert_query, values)
                        conn.commit()
                        print(f"✅ 提出時法律案をデータベースに保存しました")
                    else:
                        print(f"ℹ️ 既存の提出時法律案が存在するため、スキップしました")

        except Exception as e:
            print(f"❌ データベース保存エラー: {e}")
            raise
