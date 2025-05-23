import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoteButtons } from "@/components/vote-buttons"
import { Calendar, User, Filter, ArrowUpDown } from "lucide-react"
import { Search } from "@/components/search"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cookies } from "next/headers"
import { getUserVotes } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryTabs } from "@/components/category-tabs"

interface BillsPageProps {
  searchParams: {
    q?: string
    category?: string
    status?: string
    sort?: string
    page?: string
  }
}

function MobileCategoryTabs({ category }: { category?: string }) {
  return (
    <div className="md:hidden overflow-x-auto flex py-2 mb-4 gap-2">
      <Link
        href="/bills?category=all"
        className={`category-pill ${!category || category === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
      >
        総合
      </Link>
      <Link
        href="/bills?category=economy"
        className={`category-pill ${category === "economy" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
      >
        経済
      </Link>
      <Link
        href="/bills?category=welfare"
        className={`category-pill ${category === "welfare" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
      >
        福祉
      </Link>
      <Link
        href="/bills?category=education"
        className={`category-pill ${category === "education" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
      >
        教育
      </Link>
      <Link
        href="/bills?category=environment"
        className={`category-pill ${category === "environment" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
      >
        環境
      </Link>
      <Link
        href="/bills?category=digital"
        className={`category-pill ${category === "digital" ? "bg-primary text-white" : "bg-gray-100 text-gray-800"}`}
      >
        デジタル
      </Link>
    </div>
  )
}

export default function BillsPage({ searchParams }: BillsPageProps) {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("currentUser")
  const currentUser = userCookie ? JSON.parse(userCookie.value) : null

  // ユーザーの投票情報を取得
  const userVotes = currentUser ? getUserVotes(currentUser.id) : []

  const { q, category, status, sort } = searchParams

  // 実際の実装ではAPIからデータを取得します
  // 検索クエリやカテゴリに基づいてフィルタリングする
  let bills = [
    {
      id: "bill-2023-001",
      title: "デジタル社会形成基本法の一部を改正する法律案",
      summary:
        "デジタル社会の形成に関する施策を総合的かつ効果的に推進するため、デジタル社会形成基本法の一部を改正し、基本理念の追加、国の責務の明確化等を行う。",
      status: "審議中",
      category: "デジタル",
      submittedDate: "2023-10-15",
      submittedBy: "内閣",
    },
    {
      id: "bill-2023-002",
      title: "地域における再生可能エネルギーの導入の促進に関する法律案",
      summary:
        "地域における再生可能エネルギーの導入を促進するため、市町村による再生可能エネルギー導入促進区域の指定、事業計画の認定制度等を創設する。",
      status: "可決",
      category: "環境",
      submittedDate: "2023-09-05",
      submittedBy: "環境省",
    },
    {
      id: "bill-2023-003",
      title: "子ども・子育て支援法の一部を改正する法律案",
      summary:
        "子ども・子育て支援の充実を図るため、子ども・子育て支援法の一部を改正し、保育の質の向上、待機児童解消のための措置等を講ずる。",
      status: "審議中",
      category: "福祉",
      submittedDate: "2023-11-20",
      submittedBy: "厚生労働省",
    },
    {
      id: "bill-2023-004",
      title: "労働基準法の一部を改正する法律案",
      summary:
        "多様な働き方に対応するため、労働基準法の一部を改正し、フレックスタイム制の拡充、テレワークに関する規定の整備等を行う。",
      status: "審議中",
      category: "労働",
      submittedDate: "2023-12-01",
      submittedBy: "厚生労働省",
    },
    {
      id: "bill-2023-005",
      title: "地方税法の一部を改正する法律案",
      summary:
        "地方税制の見直しを行うため、地方税法の一部を改正し、固定資産税の評価方法の見直し、ふるさと納税制度の改正等を行う。",
      status: "審議中",
      category: "地方",
      submittedDate: "2023-11-28",
      submittedBy: "総務省",
    },
    {
      id: "bill-2023-006",
      title: "高等教育の修学支援に関する法律案",
      summary:
        "高等教育の修学支援の充実を図るため、高等教育の修学支援に関する法律の一部を改正し、支援対象者の拡大、支援内容の充実等を行う。",
      status: "審議前",
      category: "教育",
      submittedDate: "2023-12-05",
      submittedBy: "文部科学省",
    },
    {
      id: "bill-2023-007",
      title: "デジタル手続法の一部を改正する法律案",
      summary:
        "行政手続のデジタル化を推進するため、デジタル手続法の一部を改正し、オンライン化の対象範囲の拡大、本人確認方法の多様化等を行う。",
      status: "審議中",
      category: "デジタル",
      submittedDate: "2023-11-10",
      submittedBy: "デジタル庁",
    },
    {
      id: "bill-2023-008",
      title: "マイナンバー法の一部を改正する法律案",
      summary:
        "マイナンバー制度の利便性向上と安全性確保のため、マイナンバー法の一部を改正し、利用範囲の拡大、本人同意に基づく情報連携の拡充等を行う。",
      status: "審議前",
      category: "デジタル",
      submittedDate: "2023-11-25",
      submittedBy: "デジタル庁",
    },
  ]

  // カテゴリの英語名と日本語名のマッピングを追加します
  const categoryNameMap: { [key: string]: string } = {
    all: "総合",
    economy: "経済",
    welfare: "福祉",
    education: "教育",
    environment: "環境",
    security: "安全保障",
    labor: "労働",
    digital: "デジタル",
    local: "地方",
  }

  // 検索クエリによるフィルタリング
  if (q) {
    const query = q.toLowerCase()
    bills = bills.filter(
      (bill) =>
        bill.title.toLowerCase().includes(query) ||
        bill.summary.toLowerCase().includes(query) ||
        bill.submittedBy.toLowerCase().includes(query),
    )
  }

  // カテゴリによるフィルタリング
  if (category && category !== "all") {
    bills = bills.filter((bill) => bill.category.toLowerCase() === category.toLowerCase())
  }

  // ステータスによるフィルタリング
  if (status && status !== "all") {
    const statusMap: { [key: string]: string } = {
      pending: "審議前",
      "in-progress": "審議中",
      approved: "可決",
      rejected: "否決",
    }
    const statusValue = statusMap[status]
    if (statusValue) {
      bills = bills.filter((bill) => bill.status === statusValue)
    }
  }

  // ソート
  if (sort) {
    switch (sort) {
      case "newest":
        bills.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
        break
      case "oldest":
        bills.sort((a, b) => new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime())
        break
      case "title-asc":
        bills.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        bills.sort((a, b) => b.title.localeCompare(a.title))
        break
    }
  } else {
    // デフォルトは新しい順
    bills.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
  }

  const categoryDisplayName = category ? categoryNameMap[category] || category : ""
  const searchTerm = q || category ? (q ? `"${q}"` : `カテゴリ: ${categoryDisplayName}`) : ""

  return (
    <div className="actpicks-container py-4 md:py-6">
      <CategoryTabs />

      {/* モバイル用カテゴリータブ */}
      <MobileCategoryTabs category={category} />

      <div className="mb-6">
        <Search redirectPath="/bills" />
      </div>

      {/* 検索結果の表示 */}
      {searchTerm && (
        <div className="mb-6">
          <p className="text-lg">
            {searchTerm} の検索結果: {bills.length}件
          </p>
        </div>
      )}

      {/* フィルターとソート - モバイル */}
      <div className="flex md:hidden gap-2 mb-4">
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
          <Filter className="h-3 w-3 mr-1" />
          フィルター
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
          <ArrowUpDown className="h-3 w-3 mr-1" />
          並び替え
        </Button>
      </div>

      {/* フィルターとソート - デスクトップ */}
      <div className="hidden md:flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48">
            <Select defaultValue={status || "all"}>
              <SelectTrigger className="h-9 text-sm border-gray-200">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="pending">審議前</SelectItem>
                <SelectItem value="in-progress">審議中</SelectItem>
                <SelectItem value="approved">可決</SelectItem>
                <SelectItem value="rejected">否決</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full sm:w-48">
          <Select defaultValue={sort || "newest"}>
            <SelectTrigger className="h-9 text-sm border-gray-200">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">新しい順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
              <SelectItem value="title-asc">タイトル（昇順）</SelectItem>
              <SelectItem value="title-desc">タイトル（降順）</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 法案リスト */}
      {bills.length > 0 ? (
        <div className="space-y-4 mb-8">
          {bills.map((bill) => {
            // ユーザーの投票情報から、この法案への投票を取得
            const billVote = (userVotes.find((v) => v.billId === bill.id)?.vote || null) as "agree" | "disagree" | null

            return (
              <div key={bill.id} className="bill-card">
                <div className="flex gap-2 mb-2">
                  <Badge
                    variant={bill.status === "可決" ? "default" : bill.status === "審議中" ? "secondary" : "outline"}
                    className={bill.status === "可決" ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    {bill.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    {bill.category}
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/5 flex-shrink-0">
                    <div className="aspect-[16/9] rounded-md overflow-hidden">
                      <Image
                        src={`/naikaku.jpg?height=169&width=300&text=${encodeURIComponent(bill.category)}`}
                        alt={`${bill.category}のイメージ`}
                        width={300}
                        height={169}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:w-4/5">
                    <h3 className="text-base font-bold mb-2">
                      <Link href={`/bills/${bill.id}`} className="hover:text-primary transition-colors">
                        {bill.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{bill.summary}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>提出: {bill.submittedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{bill.submittedDate}</span>
                        </div>
                      </div>
                      <VoteButtons billId={bill.id} compact initialVote={billVote} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="mb-8 border-muted">
          <CardContent className="py-8 text-center">
            <p className="text-lg mb-4">検索結果が見つかりませんでした。</p>
            <p className="text-muted-foreground mb-6 text-sm">
              別のキーワードで検索するか、カテゴリから法案を探してみてください。
            </p>
            <Button asChild>
              <Link href="/bills">すべての法案を見る</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
