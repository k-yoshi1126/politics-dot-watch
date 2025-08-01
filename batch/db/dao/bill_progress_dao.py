from datetime import datetime
from typing import Dict, Union

from db.base import DatabaseConnection


class BillProgressDao:
    """議案審議経過情報のデータベースアクセスオブジェクト"""

    @staticmethod
    def save(progress_data: Dict[str, Union[str, int, datetime, None]], session: str) -> None:
        """スクレイピングした議案審議経過情報をデータベースに保存"""
        try:
            # データベースに接続
            with DatabaseConnection.get_connection() as conn:
                with conn.cursor() as cur:
                    # 現在時刻を取得
                    current_time = datetime.now()

                    # 複合キーで既存データを確認
                    cur.execute("""
                        SELECT COUNT(*) FROM "BillProgress"
                        WHERE session = %s AND "submitSession" = %s AND number = %s
                    """, (int(session), progress_data['議案提出回次'], progress_data['議案番号']))

                    if cur.fetchone()[0] == 0:
                        # データが存在しない場合のみ追加
                        insert_query = """
                            INSERT INTO "BillProgress" (
                                session, "submitSession", number,
                                "billType", "billTitle", submitter, "submitterParty",
                                "houseInitialReviewDate", "houseInitialCommittee", "houseInitialCommitteeDate",
                                "houseReviewDate", "houseCommittee", "houseCommitteeDate",
                                "houseCommitteeResult", "houseCommitteeEndDate",
                                "houseResult", "houseEndDate",
                                "housePartyAttitude", "houseSupportingParties", "houseOpposingParties",
                                "councilInitialReviewDate", "councilInitialCommittee", "councilInitialCommitteeDate",
                                "councilReviewDate", "councilCommittee", "councilCommitteeDate",
                                "councilCommitteeResult", "councilCommitteeEndDate",
                                "councilResult", "councilEndDate",
                                "enactmentDate", "lawNumber",
                                submitters, supporters,
                                "createdAt", "updatedAt"
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                                %s, %s, %s, %s, %s, %s
                            )
                        """

                        # データを整形
                        values = (
                            int(session), int(progress_data['議案提出回次']), int(progress_data['議案番号']),
                            progress_data.get('議案種類'),
                            progress_data.get('議案件名'),
                            progress_data.get('議案提出者'),
                            progress_data.get('議案提出会派'),
                            progress_data.get('衆議院予備審査議案受理年月日'),
                            progress_data.get('衆議院予備付託委員会'),
                            progress_data.get('衆議院予備付託年月日'),
                            progress_data.get('衆議院議案受理年月日'),
                            progress_data.get('衆議院付託委員会'),
                            progress_data.get('衆議院付託年月日'),
                            progress_data.get('衆議院審査結果'),
                            progress_data.get('衆議院審査終了年月日'),
                            progress_data.get('衆議院審議結果'),
                            progress_data.get('衆議院審議終了年月日'),
                            progress_data.get('衆議院審議時会派態度'),
                            progress_data.get('衆議院審議時賛成会派'),
                            progress_data.get('衆議院審議時反対会派'),
                            progress_data.get('参議院予備審査議案受理年月日'),
                            progress_data.get('参議院予備付託委員会'),
                            progress_data.get('参議院予備付託年月日'),
                            progress_data.get('参議院議案受理年月日'),
                            progress_data.get('参議院付託委員会'),
                            progress_data.get('参議院付託年月日'),
                            progress_data.get('参議院審査結果'),
                            progress_data.get('参議院審査終了年月日'),
                            progress_data.get('参議院審議結果'),
                            progress_data.get('参議院審議終了年月日'),
                            progress_data.get('公布年月日'),
                            progress_data.get('法律番号'),
                            progress_data.get('議案提出者一覧'),
                            progress_data.get('議案提出の賛成者'),
                            current_time,  # createdAt
                            current_time   # updatedAt
                        )

                        cur.execute(insert_query, values)
                        conn.commit()
                        print("✅ 議案審議経過情報をデータベースに保存しました")
                    else:
                        print("ℹ️ 既存の議案審議経過情報が存在するため、スキップしました")

        except Exception as e:
            print(f"❌ データベース保存エラー: {e}")
            raise
