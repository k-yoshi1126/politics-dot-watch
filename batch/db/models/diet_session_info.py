from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime

from db.base import Base

class DietSessionInfo(Base):
    """国会回次情報モデル"""
    __tablename__ = "DietSessionInfo"

    session = Column(Integer, primary_key=True, nullable=False)  # 国会会期
    submit_session = Column(Integer, primary_key=True, nullable=False)  # 提出会期
    number = Column(Integer, primary_key=True, nullable=False)  # 議案番号
    title = Column(String, nullable=False)  # 議案名
    status = Column(String)  # 審議状況
    progress_url = Column(String)  # 経過情報URL
    content_url = Column(String)  # 本文情報URL
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        return f"<DietSessionInfo(session={self.session}, submit_session={self.submit_session}, number={self.number})>" 