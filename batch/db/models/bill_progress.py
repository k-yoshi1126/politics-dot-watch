from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, ForeignKeyConstraint
from sqlalchemy.orm import relationship

from db.base import Base

class BillProgress(Base):
    """議案審議経過情報モデル"""
    __tablename__ = "BillProgress"

    session = Column(Integer, primary_key=True, nullable=False)  # 国会回次
    submit_session = Column(Integer, primary_key=True, nullable=False)  # 提出国会回次
    number = Column(Integer, primary_key=True, nullable=False)  # 番号
    bill_type = Column(String(50))  # 議案種類
    bill_title = Column(Text, nullable=False)  # 議案件名
    submitter = Column(Text)  # 議案提出者
    submitter_party = Column(Text)  # 議案提出会派
    house_initial_review_date = Column(DateTime)  # 衆議院予備審査議案受理年月日
    house_initial_committee_date = Column(DateTime)  # 衆議院予備付託年月日
    house_initial_committee = Column(Text)  # 衆議院予備付託委員会
    house_review_date = Column(DateTime)  # 衆議院議案受理年月日
    house_committee_date = Column(DateTime)  # 衆議院付託年月日
    house_committee = Column(Text)  # 衆議院付託委員会
    house_committee_end_date = Column(DateTime)  # 衆議院審査終了年月日
    house_committee_result = Column(Text)  # 衆議院審査結果
    house_end_date = Column(DateTime)  # 衆議院審議終了年月日
    house_result = Column(Text)  # 衆議院審議結果
    house_party_attitude = Column(Text)  # 衆議院審議時会派態度
    house_supporting_parties = Column(Text)  # 衆議院審議時賛成会派
    house_opposing_parties = Column(Text)  # 衆議院審議時反対会派
    council_initial_review_date = Column(DateTime)  # 参議院予備審査議案受理年月日
    council_initial_committee_date = Column(DateTime)  # 参議院予備付託年月日
    council_initial_committee = Column(Text)  # 参議院予備付託委員会
    council_review_date = Column(DateTime)  # 参議院議案受理年月日
    council_committee_date = Column(DateTime)  # 参議院付託年月日
    council_committee = Column(Text)  # 参議院付託委員会
    council_committee_end_date = Column(DateTime)  # 参議院審査終了年月日
    council_committee_result = Column(Text)  # 参議院審査結果
    council_end_date = Column(DateTime)  # 参議院審議終了年月日
    council_result = Column(Text)  # 参議院審議結果
    enactment_date = Column(DateTime)  # 公布年月日
    law_number = Column(String(50))  # 法律番号
    submitters = Column(Text)  # 議案提出者一覧
    supporters = Column(Text)  # 議案提出の賛成者
    created_at = Column(DateTime, default=datetime.now)  # 作成日時
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)  # 更新日時

    # DietSessionInfoとの関連付け
    diet_session_info = relationship("DietSessionInfo", foreign_keys=[session, submit_session, number])

    __table_args__ = (
        ForeignKeyConstraint(
            ['session', 'submit_session', 'number'],
            ['DietSessionInfo.session', 'DietSessionInfo.submit_session', 'DietSessionInfo.number']
        ),
    )

    def __repr__(self):
        return f"<BillProgress(session={self.session}, submit_session={self.submit_session}, number={self.number})>" 