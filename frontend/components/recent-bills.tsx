import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VoteButtons } from "@/components/vote-buttons"

export function RecentBills() {
  // 実際の実装ではAPIからデータを取得します
  const recentBills = [
    {
      id: "bill-2023-004",
      title: "労働基準法の一部を改正する法律案",
      summary:
        "多様な働き方に対応するため、労働基準法の一部を改正し、フレックスタイム制の拡充、テレワークに関する規定の整備等を行う。",
      status: "審議中",
      category: "労働",
      submittedDate: "2023-12-01",
    },
    {
      id: "bill-2023-005",
      title: "地方税法の一部を改正する法律案",
      summary:
        "地方税制の見直しを行うため、地方税法の一部を改正し、固定資産税の評価方法の見直し、ふるさと納税制度の改正等を行う。",
      status: "審議中",
      category: "地方",
      submittedDate: "2023-11-28",
    },
    {
      id: "bill-2023-006",
      title: "高等教育の修学支援に関する法律の一部を改正する法律案",
      summary:
        "高等教育の修学支援の充実を図るため、高等教育の修学支援に関する法律の一部を改正し、支援対象者の拡大、支援内容の充実等を行う。",
      status: "審議前",
      category: "教育",
      submittedDate: "2023-12-05",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recentBills.map((bill) => (
        <Card
          key={bill.id}
          className="flex flex-col h-full border-muted hover:border-brand-200 hover:shadow-sm transition-all"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2 mb-2">
              <Badge
                variant={bill.status === "可決" ? "default" : bill.status === "審議中" ? "secondary" : "outline"}
                className={bill.status === "可決" ? "bg-brand-500 hover:bg-brand-600" : ""}
              >
                {bill.status}
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                {bill.category}
              </Badge>
            </div>
            <CardTitle className="text-base">
              <Link href={`/bills/${bill.id}`} className="hover:text-brand-600 transition-colors">
                {bill.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground leading-relaxed">{bill.summary}</p>
            <p className="text-xs text-muted-foreground mt-2">提出日: {bill.submittedDate}</p>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2">
            <VoteButtons billId={bill.id} />
            <Button variant="outline" asChild className="w-full text-sm h-9">
              <Link href={`/bills/${bill.id}`}>詳細を見る</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
