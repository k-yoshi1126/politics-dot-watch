from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class BillContentInfoUrl(Base):
    """議案本文情報リンクモデル"""

    __tablename__ = "BillContentInfoUrl"

    submitSession = Column(Integer, primary_key=True, comment="提出国会回次")
    number = Column(Integer, primary_key=True, comment="番号")
    text = Column(Text, nullable=False, comment="テキスト")
    url = Column(Text, nullable=False, comment="URL")
    createdAt = Column(
        DateTime, nullable=False, default=datetime.now, comment="作成日時"
    )
    updatedAt = Column(
        DateTime,
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now,
        comment="更新日時",
    )

    def __repr__(self):
        return f"<BillContentInfoUrl(submitSession={self.submitSession}, number={self.number}, text='{self.text}')>"
