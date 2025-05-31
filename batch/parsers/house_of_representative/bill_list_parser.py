from typing import List
from bs4 import BeautifulSoup

class BillListParser:
    """議案一覧ページのパース処理クラス"""
    
    HEADERS = ['提出回次', '番号', '議案件名', '審議状況', '経過情報', '本文情報']
    
    @staticmethod
    def extract_bill_table(soup: BeautifulSoup, table_class: str = 'table') -> List[List[str]]:
        """議案一覧表のデータを抽出"""
        table_data = []
        
        # 表を取得
        table = soup.find('table', class_=table_class)
        if not table:
            return table_data
            
        # ヘッダー行を取得
        headers = []
        header_row = table.find('tr')
        if header_row:
            for th in header_row.find_all('th'):
                header_text = th.find('span', class_='txt03')
                if header_text:
                    headers.append(header_text.get_text().strip())
        
        # データ行を取得
        for row in table.find_all('tr')[1:]:  # ヘッダー行をスキップ
            row_data = []
            for td in row.find_all('td'):
                # リンクがある場合はリンクのURLを取得
                link = td.find('a')
                if link and 'href' in link.attrs:
                    row_data.append(link['href'])
                else:
                    # 通常のテキストを取得
                    span = td.find('span', class_='txt03')
                    if span:
                        row_data.append(span.get_text().strip())
                    else:
                        row_data.append('')
            
            if row_data:  # 空でない場合のみ追加
                table_data.append(row_data)
        
        # テーブルデータを出力
        BillListParser.format_table_output(table_data, BillListParser.HEADERS)
        
        return table_data

    @staticmethod
    def format_table_output(table_data: List[List[str]], headers: List[str]) -> None:
        """テーブルデータを整形して出力"""
        if not table_data:
            return

        # ヘッダー行を出力
        print("\n📋 データ一覧:")
        print("=" * 120)
        header_format = " ".join(f"{{:<{len(h) + 2}}}" for h in headers)
        print(header_format.format(*headers))
        print("-" * 120)

        # データ行を出力
        for row in table_data:
            # 長いテキストは省略
            formatted_row = []
            for cell in row:
                if len(cell) > 45:
                    formatted_row.append(cell[:42] + "...")
                else:
                    formatted_row.append(cell)
            print(header_format.format(*formatted_row))

        print("=" * 120)
        print(f"合計: {len(table_data)}件\n")
