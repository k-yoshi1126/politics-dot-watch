from datetime import datetime
from typing import Dict, Union, List, Tuple
import psycopg2
from psycopg2.extras import execute_values

from db.base import DatabaseConnection


class BillContentInfoUrlDao:
    """議案本文情報リンクのデータベースアクセスオブジェクト"""

    @staticmethod
    def save(
        content_info_list: List[Dict[str, str]], submit_session: int, number: int
    ) -> List[Dict[str, str]]:
        """スクレイピングした議案本文情報リンクをデータベースに保存

        Returns:
            List[Dict[str, str]]: 新規保存されたデータのリスト。各要素は {'テキスト': str, 'URL': str} の形式。
                                 既存データのみの場合は空リストを返す。
        """
        try:
            # データベースに接続
            with DatabaseConnection.get_connection() as conn:
                with conn.cursor() as cur:
                    # 現在時刻を取得
                    current_time = datetime.now()

                    saved_items = []
                    for content_info in content_info_list:
                        try:
                            # 複合キーで既存データを確認
                            cur.execute(
                                """
                                SELECT COUNT(*) FROM "BillContentInfoUrl"
                                WHERE "submitSession" = %s AND number = %s AND text = %s
                            """,
                                (submit_session, number, content_info["テキスト"]),
                            )

                            if cur.fetchone()[0] == 0:
                                # データが存在しない場合のみ追加
                                insert_query = """
                                    INSERT INTO "BillContentInfoUrl" (
                                        "submitSession", number, text, url,
                                        "createdAt", "updatedAt"
                                    ) VALUES (
                                        %s, %s, %s, %s, %s, %s
                                    )
                                """

                                # データを整形
                                values = (
                                    submit_session,
                                    number,
                                    content_info["テキスト"],
                                    content_info["URL"],
                                    current_time,  # createdAt
                                    current_time,  # updatedAt
                                )

                                cur.execute(insert_query, values)
                                conn.commit()
                                saved_items.append(content_info)
                                print(
                                    f"✅ 議案本文情報リンクをデータベースに保存しました: {content_info['テキスト']}"
                                )
                            else:
                                print(
                                    f"ℹ️ 既存の議案本文情報リンクが存在するため、スキップしました: {content_info['テキスト']}"
                                )
                        except Exception as e:
                            conn.rollback()
                            raise e

                    return saved_items

        except Exception as e:
            print(f"❌ データベース保存エラー: {e}")
            raise
