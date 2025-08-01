from datetime import datetime
from typing import Dict

from db.base import DatabaseConnection


class BillProposedAmendmentDao:
    """修正案のデータベースアクセスオブジェクト"""

    @staticmethod
    def save(amendment_data: Dict[str, str], submit_session: int, number: int) -> None:
        """スクレイピングした修正案をデータベースに保存"""
        try:
            # データベースに接続
            with DatabaseConnection.get_connection() as conn:
                with conn.cursor() as cur:
                    # 現在時刻を取得
                    current_time = datetime.now()

                    # 複合キーで既存データを確認
                    cur.execute(
                        """
                        SELECT COUNT(*) FROM "BillProposedAmendment"
                        WHERE "submitSession" = %s AND number = %s
                    """,
                        (submit_session, number),
                    )

                    if cur.fetchone()[0] == 0:
                        # データが存在しない場合のみ追加
                        insert_query = """
                            INSERT INTO "BillProposedAmendment" (
                                "submitSession", number, "proposedAmendment",
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s
                            )
                        """

                        # データを整形
                        values = (
                            submit_session,
                            number,
                            amendment_data.get("修正案"),
                            current_time,  # createdAt
                            current_time,  # updatedAt
                        )

                        cur.execute(insert_query, values)
                        conn.commit()
                        print("✅ 修正案をデータベースに保存しました")
                    else:
                        print("ℹ️ 既存の修正案が存在するため、スキップしました")

        except Exception as e:
            print(f"❌ データベース保存エラー: {e}")
            raise
