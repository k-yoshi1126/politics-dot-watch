from typing import List
from collections import Counter
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from db.models.bill import BillData

class BillDisplayer:
    """議案データ表示クラス"""
    
    def __init__(self):
        self.console = Console()

    def display_bills(self, bills: List[BillData]):
        """議案一覧を表示"""
        if not bills:
            self.console.print("❌ 表示する議案がありません", style="red")
            return

        self.console.print(f"\n📊 スクレイピング結果: {len(bills)}件の議案を取得しました", style="bold blue")
        self.console.print("=" * 80)

        for i, bill in enumerate(bills, 1):
            self._display_single_bill(bill, i)

        self.console.print(f"\n✨ 取得完了: 合計 {len(bills)} 件の議案情報を表示しました\n", style="bold green")

    def _display_single_bill(self, bill: BillData, index: int):
        """単一議案を表示"""
        self.console.print(f"\n【議案 {index}】", style="bold yellow")
        
        table = Table(show_header=False, box=None, padding=(0, 1))
        table.add_column("項目", style="cyan", width=12)
        table.add_column("内容", style="white")
        
        table.add_row("🏷️ 議案番号", bill.bill_number)
        table.add_row("📝 タイトル", bill.title)
        
        if bill.submitter:
            table.add_row("👤 提出者", bill.submitter)
        
        if bill.submitted_date:
            table.add_row("📅 提出日", bill.submitted_date.strftime('%Y年%m月%d日'))
        
        if bill.status:
            table.add_row("📊 状況", bill.status)
        
        if bill.passed_date:
            table.add_row("✅ 可決日", bill.passed_date.strftime('%Y年%m月%d日'))
        
        if bill.full_text:
            preview = bill.full_text[:100] + "..." if len(bill.full_text) > 100 else bill.full_text
            table.add_row("📄 法案概要", preview)
        
        if bill.progress_info:
            progress_items = list(bill.progress_info.items())[:3]
            progress_text = "\n".join([f"• {k}: {v}" for k, v in progress_items])
            table.add_row("📋 進捗情報", progress_text)
        
        table.add_row("🔗 URL", bill.source_url or "N/A")
        
        self.console.print(table)
        self.console.print("-" * 80, style="dim")

    def display_summary(self, bills: List[BillData]):
        """取得結果のサマリーを表示"""
        if not bills:
            return

        self.console.print("\n📈 取得結果サマリー", style="bold blue")
        
        # 基本統計
        summary_table = Table(show_header=False, box=None)
        summary_table.add_column("項目", style="cyan")
        summary_table.add_column("件数", style="white")
        
        summary_table.add_row("📊 総議案数", str(len(bills)))
        summary_table.add_row("📅 提出日情報あり", str(len([b for b in bills if b.submitted_date])))
        summary_table.add_row("📝 全文情報あり", str(len([b for b in bills if b.full_text])))
        summary_table.add_row("👤 提出者情報あり", str(len([b for b in bills if b.submitter])))
        
        self.console.print(summary_table)

        # 審議状況別集計
        statuses = [b.status for b in bills if b.status]
        if statuses:
            self.console.print("\n🏷️ 審議状況別:", style="bold")
            status_counter = Counter(statuses)
            for status, count in status_counter.most_common():
                self.console.print(f"   {status}: {count}件")

        # 提出者別集計
        submitters = [b.submitter for b in bills if b.submitter]
        if submitters:
            self.console.print("\n👥 提出者別 (上位5位):", style="bold")
            submitter_counter = Counter(submitters)
            for submitter, count in submitter_counter.most_common(5):
                self.console.print(f"   {submitter}: {count}件")

        self.console.print("=" * 80)

    def display_bill_detail(self, bill: BillData):
        """法案の詳細を表示"""
        self.console.print(f"\n[bold cyan]【{bill.bill_number}】[/bold cyan] {bill.title}")
        self.console.print(f"\n[bold]提出者:[/bold] {bill.submitter or '不明'}")
        self.console.print(f"[bold]提出日:[/bold] {bill.submitted_date.strftime('%Y/%m/%d') if bill.submitted_date else '不明'}")
        self.console.print(f"[bold]審議状況:[/bold] {bill.status or '不明'}")
        
        if bill.full_text:
            self.console.print("\n[bold]法案本文:[/bold]")
            self.console.print(bill.full_text)
        
        if bill.reason:
            self.console.print("\n[bold]提出理由:[/bold]")
            self.console.print(bill.reason)