from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any

@dataclass
class BillData:
    """議案データクラス"""
    bill_number: str  # 提出回次-番号の形式
    title: str
    status: str
    progress_url: str
    content_url: str
    source_url: str
    submitter: Optional[str] = None
    submitted_date: Optional[datetime] = None
    full_text: Optional[str] = None
    reason: Optional[str] = None
    passed_date: Optional[datetime] = None
    progress_info: Optional[Dict[str, str]] = None

    def __str__(self) -> str:
        return f"【{self.bill_number}】 {self.title}"

    def to_dict(self) -> Dict:
        """辞書形式に変換"""
        return {
            'bill_number': self.bill_number,
            'title': self.title,
            'status': self.status,
            'progress_url': self.progress_url,
            'content_url': self.content_url,
            'source_url': self.source_url,
            'submitter': self.submitter,
            'submitted_date': self.submitted_date.isoformat() if self.submitted_date else None,
            'full_text': self.full_text,
            'reason': self.reason,
            'passed_date': self.passed_date.isoformat() if self.passed_date else None,
            'progress_info': self.progress_info
        }