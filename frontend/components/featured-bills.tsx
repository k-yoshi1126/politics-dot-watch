import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VoteButtons } from "@/components/vote-buttons"

export function FeaturedBills() {
  // 実際の実装ではAPIからデータを取得します
  const featuredBills = [
    {
      id: "bill-2023-001",
      title: "デジタル社会形成基本法の一部を改正する法律案",
      summary:
        "デジタル社会の形成に関する施策を総合的かつ効果的に推進するため、デジタル社会形成基本法の一部を改正し、基本理念の追加、国の責務の明確化等を行う。",
      status: "審議中",
      category: "デジタル",
      submittedDate: "2023-10-15",
      priority: true,
    },
    {
      id: "bill-2023-002",
      title: "地域における再生可能エネルギーの導入の促進に関する法律案",
      summary:
        "地域における再生可能エネルギーの導入を促進するため、市町村による再生可能エネルギー導入促進区域の指定、事業計画の認定制度等を創設する。",
      status: "可決",
      category: "環境",
      submittedDate: "2023-09-05",
      priority: true,
    },
    {
      id: "bill-2023-003",
      title: "子ども・子育て支援法の一部を改正する法律案",
      summary:
        "子ども・子育て支援の充実を図るため、子ども・子育て支援法の一部を改正し、保育の質の向上、待機児童解消のための措置等を講ずる。",
      status: "審議中",
      category: "福祉",
      submittedDate: "2023-11-20",
      priority: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featuredBills.map((bill) => (
        <Card
          key={bill.id}
          className="flex flex-col h-full border-muted hover:border-brand-200 hover:shadow-sm transition-all"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2 mb-2">
              <Badge
                variant={bill.status === "可決" ? "default" : "secondary"}
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
