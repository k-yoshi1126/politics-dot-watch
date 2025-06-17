import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoteButtons } from "@/components/vote-buttons"
import { Calendar, User, Filter, ArrowUpDown, Landmark } from "lucide-react"
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
import { prisma } from "@/lib/prisma"

interface BillsPageProps {
  searchParams: {
    q?: string
    category?: string
    status?: string
    sort?: string
    page?: string
  }
}

interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  category: string;
  submittedDate: string;
  submittedBy: string;
  submitterParty: string;
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

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("currentUser")
  const currentUser = userCookie ? JSON.parse(userCookie.value) : null

  // ユーザーの投票情報を取得
  const userVotes = currentUser ? getUserVotes(currentUser.id) : []

  const { q, category, status, sort, page = "1" } = searchParams
  const currentPage = parseInt(page)
  const itemsPerPage = 10

  // DBから法案データを取得
  let bills: Bill[] = [];
  let totalCount = 0;
  try {
    // 総件数を取得
    totalCount = await prisma.dietSessionInfo.count();

    // ページネーション用のデータを取得
    const dbBills = await prisma.dietSessionInfo.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        session: true,
        submitSession: true,
        number: true,
        title: true,
        status: true,
        createdAt: true,
        // BillProgressは後で個別取得するため、ここでは取得しない
        // billProgress: {
        //   select: {
        //     submitter: true,
        //     submitterParty: true,
        //     billType: true,
        //     houseReviewDate: true
        //   }
        // }
      }
    });

    // 各法案の詳細なBillProgress情報を取得し、提出日を決定
    bills = await Promise.all(dbBills.map(async (bill) => {
      // BillAISummaryを取得
      const billAISummary = await prisma.billAISummary.findUnique({
        where: {
          submitSession_number: {
            submitSession: bill.submitSession,
            number: bill.number
          }
        }
      });

      const billProgressEntries = await prisma.billProgress.findMany({
        where: {
          submitSession: bill.submitSession,
          number: bill.number,
          billType: '衆法',
          houseReviewDate: { not: null }
        },
        orderBy: {
          session: 'asc'
        }
      });

      const submittedDateFromProgress = billProgressEntries.length > 0
        ? billProgressEntries[0].houseReviewDate?.toLocaleDateString('ja-JP') || "不明"
        : "不明";

      // 提出者と提出会派は、BillProgressテーブルから取得可能な最初のエントリを使用
      const submitterInfo = await prisma.billProgress.findFirst({
        where: {
          submitSession: bill.submitSession,
          number: bill.number
        },
        select: {
          submitter: true,
          submitterParty: true
        },
        orderBy: {
          session: 'asc'
        }
      });

      return {
        id: `bill-${bill.submitSession}-${bill.number}`,
        title: billAISummary?.titleSummary || bill.title,
        summary: billAISummary?.shortSummary || "法案の要約情報は現在準備中です。",
        status: bill.status,
        category: "デジタル",
        submittedDate: submittedDateFromProgress,
        submittedBy: submitterInfo?.submitter || "不明",
        submitterParty: submitterInfo?.submitterParty || "不明"
      };
    }));

  } catch (error) {
    console.error('法案データの取得に失敗しました:', error);
  }

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
      pending: "未了",
      "in-progress": "衆議院で審議中",
      "council-in-progress": "参議院で審議中",
      "house-closed": "衆議院で閉会中審査",
      "passed": "成立",
      "withdrawn": "撤回"
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

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const categoryDisplayName = category ? categoryNameMap[category] || category : ""
  const searchTerm = q || category ? (q ? `"${q}"` : `カテゴリ: ${categoryDisplayName}`) : ""

  // 修正されたページネーションロジック
  const pagesToShow: (number | '...')[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pagesToShow.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pagesToShow.push(i);
      }
      if (totalPages > 5) {
        pagesToShow.push('...');
      }
    } else if (currentPage >= totalPages - 2) {
      pagesToShow.push(1);
      if (totalPages > 5) {
        pagesToShow.push('...');
      }
      for (let i = totalPages - 3; i <= totalPages; i++) {
        if (i > 1) {
          pagesToShow.push(i);
        }
      }
    } else {
      pagesToShow.push(1);
      pagesToShow.push('...');

      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pagesToShow.push(i);
      }

      pagesToShow.push('...');
    }
  }

  return (
    <div className="politics-dot-watch-container py-4 md:py-6">
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
                <SelectItem value="pending">未了</SelectItem>
                <SelectItem value="in-progress">衆議院で審議中</SelectItem>
                <SelectItem value="council-in-progress">参議院で審議中</SelectItem>
                <SelectItem value="house-closed">衆議院で閉会中審査</SelectItem>
                <SelectItem value="passed">成立</SelectItem>
                <SelectItem value="withdrawn">撤回</SelectItem>
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
                    variant={
                      bill.status === "成立" ? "default" :
                        bill.status === "衆議院で審議中" || bill.status === "参議院で審議中" || bill.status === "衆議院で閉会中審査" ? "secondary" :
                          bill.status === "撤回" ? "destructive" :
                            "outline"
                    }
                    className={
                      bill.status === "成立" ? "bg-primary hover:bg-primary/90" :
                        bill.status === "撤回" ? "bg-destructive hover:bg-destructive/90" :
                          ""
                    }
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
                      <div className="flex items-center gap-1 text-xs text-gray-500 overflow-hidden sm:flex-grow sm:basis-0">
                        <div className="flex items-center gap-1">
                          <Landmark className="h-3 w-3" />
                          <span
                            className="
                                  truncate whitespace-nowrap overflow-hidden        /* 0〜639px ＝モバイルで省略 */
                                  sm:whitespace-normal sm:overflow-visible          /* 640px 以上では全文表示 */
                                "
                          >
                            提出会派: {bill.submitterParty}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0 sm:flex-grow sm:basis-0 sm:justify-end">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">提出者: {bill.submittedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>提出日: {bill.submittedDate}</span>
                        </div>
                      </div>
                      {/* <VoteButtons billId={bill.id} compact initialVote={billVote} /> */}
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

      {/* ページネーション */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href={`/bills?page=${currentPage > 1 ? currentPage - 1 : 1}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}${sort ? `&sort=${sort}` : ''}`}
                className={`pagination-link ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                <span className="sr-only">Previous</span>
                &lt;
              </PaginationLink>
            </PaginationItem>
            {pagesToShow.map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <PaginationLink
                    href={`/bills?page=${pageNum}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}${sort ? `&sort=${sort}` : ''}`}
                    isActive={currentPage === pageNum}
                    className="pagination-link"
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationLink
                href={`/bills?page=${currentPage < totalPages ? currentPage + 1 : totalPages}${q ? `&q=${q}` : ''}${category ? `&category=${category}` : ''}${status ? `&status=${status}` : ''}${sort ? `&sort=${sort}` : ''}`}
                className={`pagination-link ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
              >
                <span className="sr-only">Next</span>
                &gt;
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
