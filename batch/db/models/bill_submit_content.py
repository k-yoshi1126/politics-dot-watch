from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class BillSubmitContent(Base):
    """提出時法律案モデル"""

    __tablename__ = "BillSubmitContent"

    id = Column(Integer, primary_key=True, autoincrement=True)
    submitSession = Column(Integer, nullable=False, comment="提出国会回次")
    number = Column(Integer, nullable=False, comment="番号")
    content = Column(Text, nullable=False, comment="提出時法案内容")
    supplementaryProvisions = Column(Text, nullable=False, comment="附則")
    reason = Column(Text, nullable=False, comment="理由")
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
        return f"<BillSubmitContent(submitSession={self.submitSession}, number={self.number})>"
