import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/search"
import { VoteButtons } from "@/components/vote-buttons"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { CategoryTabs, MobileCategoryTabs } from "@/components/category-tabs"

import React from 'react'

export default async function Home(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions)
  const currentUser = session?.user || null
  // TODO: 投票機能の実装後に有効化
  // const userVotes = currentUser ? getUserVotes(currentUser.id) : []
  const userVotes: { billId: string; vote: "agree" | "disagree" | null }[] = []

  // 実際の実装ではAPIからデータを取得します
  const featuredBill = {
    id: "bill-2023-001",
    title: "デジタル社会形成基本法の一部を改正する法律案",
    summary:
      "デジタル社会の形成に関する施策を総合的かつ効果的に推進するため、デジタル社会形成基本法の一部を改正し、基本理念の追加、国の責務の明確化等を行う。",
    status: "審議中",
    category: "デジタル",
    submittedDate: "2023-10-15",
    submittedBy: "内閣",
    curator: "政治ドットウォッチ編集部",
  }

  const recentBills = [
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
  ]

  const popularBills = [
    {
      id: "bill-2023-005",
      title: "地方税法の一部を改正する法律案",
      summary:
        "地方税制の見直しを行うため、地方税法の一部を改正し、固定資産税の評価方法の見直し、ふるさと納税制度の改正等を行う。",
      status: "審議中",
      category: "地方",
      submittedDate: "2023-11-28",
      voteCount: 1245,
    },
    {
      id: "bill-2023-006",
      title: "高等教育の修学支援に関する法律案",
      summary:
        "高等教育の修学支援の充実を図るため、高等教育の修学支援に関する法律の一部を改正し、支援対象者の拡大、支援内容の充実等を行う。",
      status: "審議前",
      category: "教育",
      submittedDate: "2023-12-05",
      voteCount: 987,
    },
    {
      id: "bill-2023-007",
      title: "デジタル手続法の一部を改正する法律案",
      summary:
        "行政手続のデジタル化を推進するため、デジタル手続法の一部を改正し、オンライン化の対象範囲の拡大、本人確認方法の多様化等を行う。",
      status: "審議中",
      category: "デジタル",
      submittedDate: "2023-11-10",
      voteCount: 876,
    },
  ]

  // ユーザーの投票情報から、featuredBillへの投票を取得
  const featuredBillVote = userVotes.find((v) => v.billId === featuredBill.id)?.vote || null

  return (
    <div className="actpicks-container py-4 md:py-6">
      <div>
        <CategoryTabs />
      </div>
      {/* モバイル用カテゴリータブ TODO */}
      {/* <MobileCategoryTabs /> */}
      <div className="md:hidden overflow-x-auto flex py-2 mb-4 gap-2">
        <Link href="/bills?category=all" className="category-pill bg-primary text-white">
          総合
        </Link>
        <Link href="/bills?category=economy" className="category-pill bg-gray-100 text-gray-800">
          経済
        </Link>
        <Link href="/bills?category=welfare" className="category-pill bg-gray-100 text-gray-800">
          福祉
        </Link>
        <Link href="/bills?category=education" className="category-pill bg-gray-100 text-gray-800">
          教育
        </Link>
        <Link href="/bills?category=environment" className="category-pill bg-gray-100 text-gray-800">
          環境
        </Link>
        <Link href="/bills?category=security" className="category-pill bg-gray-100 text-gray-800">
          安全保障
        </Link>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <Search />
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインカラム */}
        <div className="lg:col-span-2">
          {/* 注目の法案 */}
          <div className="mb-4">
            <h2 className="section-title">注目の法案</h2>
            <div className="bill-card-featured bg-white">
              <div className="relative">
                <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/naikaku.jpg?height=450&width=800&text=${encodeURIComponent(featuredBill.category)}`}
                    alt={`${featuredBill.category}のイメージ`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">
                  <Link href={`/bills/${featuredBill.id}`} className="hover:text-primary transition-colors">
                    {featuredBill.title}
                  </Link>
                </h3>
                <div className="flex flex-wrap gap-2 pb-2">
                  <Badge
                    variant={featuredBill.status === "可決" ? "default" : "secondary"}
                    className={featuredBill.status === "可決" ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    {featuredBill.status}
                  </Badge>
                  <Badge variant="outline" className="bg-white/90 text-xs font-normal">
                    {featuredBill.category}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-4">{featuredBill.summary}</p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{featuredBill.curator}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>提出: {featuredBill.submittedDate}</span>
                    </div>
                  </div>
                  <VoteButtons
                    billId={featuredBill.id}
                    compact
                    initialVote={featuredBillVote}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="space-y-4">
              {recentBills.map((bill) => {
                // ユーザーの投票情報から、この法案への投票を取得
                const billVote = userVotes.find((v) => v.billId === bill.id)?.vote || null

                return (
                  <div key={bill.id} className="bill-card">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex-shrink-0">
                        <div className="aspect-[16/9] rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <Image
                            src={`/act.jpg?height=169&width=300&text=${encodeURIComponent(bill.category)}`}
                            alt={`${bill.category}のイメージ`}
                            width={300}
                            height={169}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:w-3/4">
                        <h3 className="text-base font-bold mb-2">
                          <Link href={`/bills/${bill.id}`} className="hover:text-primary transition-colors">
                            {bill.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap gap-2 pb-2">
                          <Badge
                            variant={
                              bill.status === "可決" ? "default" : bill.status === "審議中" ? "secondary" : "outline"
                            }
                            className={bill.status === "可決" ? "bg-primary hover:bg-primary/90" : ""}
                          >
                            {bill.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-normal">
                            {bill.category}
                          </Badge>
                        </div>
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
                          <VoteButtons 
                            billId={bill.id} 
                            compact 
                            initialVote={billVote} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/bills">もっと法案を見る</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* サイドカラム */}
        <div>
          {/* 最新の法案 */}
          <div className="mb-8 bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="section-title">最新の法案</h2>
            <div className="space-y-4">
              {popularBills.map((bill, index) => (
                <div key={bill.id} className={index < popularBills.length - 1 ? "pb-4 border-b border-gray-200" : ""}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={`/act.jpg?height=40&width=40&text=${encodeURIComponent(bill.category)}`}
                        alt={`${bill.category}のイメージ`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-1">
                        <Link href={`/bills/${bill.id}`} className="hover:text-primary transition-colors">
                          {bill.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Badge
                          variant={bill.status === "可決" ? "default" : "secondary"}
                          className={`text-[10px] px-1.5 py-0 h-4 ${bill.status === "可決" ? "bg-primary hover:bg-primary/90" : ""
                            }`}
                        >
                          {bill.status}
                        </Badge>
                        <span>{bill.category}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{bill.submittedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500">投票数:</span>
                        <span className="font-medium">{bill.voteCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

const categories = [
  { id: "economy", name: "経済", count: 42 },
  { id: "welfare", name: "福祉", count: 38 },
  { id: "education", name: "教育", count: 25 },
  { id: "environment", name: "環境", count: 31 },
  { id: "security", name: "安全保障", count: 19 },
  { id: "labor", name: "労働", count: 27 },
  { id: "digital", name: "デジタル", count: 23 },
  { id: "local", name: "地方", count: 34 },
]

