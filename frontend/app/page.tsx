import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/search"
import { VoteButtons } from "@/components/vote-buttons"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Landmark } from "lucide-react"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { CategoryTabs, MobileCategoryTabs } from "@/components/category-tabs"
import { prisma } from "@/lib/prisma"
import { DietSessionInfo, BillProgress, Prisma } from "@prisma/client"

import React from 'react'

// Define the type that matches the result of the Prisma query
type BillProgressWithDietSession = Prisma.BillProgressGetPayload<{
  include: { dietSessionInfo: true }
}>;

export default async function Home(): Promise<React.JSX.Element> {
  const session = await getServerSession(authOptions)
  const currentUser = session?.user || null
  // TODO: 投票機能の実装後に有効化
  // const userVotes = currentUser ? getUserVotes(currentUser.id) : []
  const userVotes: { billId: string; vote: "agree" | "disagree" | null }[] = []

  // DietSessionInfoから最新の法案情報を取得
  type BillWithProgress = {
    session: number;
    submitSession: number;
    number: number;
    title: string;
    status: string;
    createdAt: Date;
    billProgress: BillProgress | null; // BillProgress全体を含むように修正
  };

  // BillProgress[] を BillProgress | null に変更
  // type BillWithMultipleProgress = {
  //   session: number;
  //   submitSession: number;
  //   number: number;
  //   title: string;
  //   status: string;
  //   createdAt: Date;
  //   billProgress: BillProgress[]; // 複数のBillProgressを含む可能性を考慮
  // };

  // メインカラム用の法案データを取得
  let mainBills: BillProgressWithDietSession[] = []; // 型を修正
  try {
    // 最新の提出国会回次を取得
    const latestSubmitSession = await prisma.dietSessionInfo.findFirst({
      orderBy: {
        submitSession: 'desc'
      },
      select: {
        submitSession: true
      }
    });

    if (latestSubmitSession) {
      // 最新の提出国会回次の法案を取得（メインカラム用）
      // BillProgressを複数取得するため、DietSessionInfoから直接取得するのではなく、
      // BillProgressからsubmitSessionとnumberでフィルタリングして取得し、DietSessionInfoをincludeする形に変更
      mainBills = await prisma.billProgress.findMany({
        where: {
          submitSession: latestSubmitSession.submitSession
          // DietSessionInfoのリレーションではなくBillProgress自体を複数取得するため、numberでのフィルタリングは後で行う
        },
        take: 4, // 注目の法案1件と最新の法案3件分
        orderBy: {
          number: 'asc' // 法案番号でソート
        },
        include: {
          dietSessionInfo: true // DietSessionInfo情報も取得
        },
        distinct: ['number'] // 法案番号の重複を排除
      });
      console.log('メインカラム用の法案データ:', mainBills);
    }
  } catch (error) {
    console.error('メインカラム用の法案データの取得に失敗しました:', error);
  }

  // サイドカラム用の法案データを取得
  let sideBills: BillProgressWithDietSession[] = []; // 型を修正
  try {
    // 最新の提出国会回次を取得 (mainBills取得時に取得済みだが、可読性のため再度)
    const latestSubmitSession = await prisma.dietSessionInfo.findFirst({
      orderBy: {
        submitSession: 'desc'
      },
      select: {
        submitSession: true
      }
    });

    if (latestSubmitSession) {
      // 最新の提出国会回次の法案を取得（サイドカラム用）
      // BillProgressを複数取得するため、DietSessionInfoから直接取得するのではなく、
      // BillProgressからsubmitSessionとnumberでフィルタリングして取得し、DietSessionInfoをincludeする形に変更
      sideBills = await prisma.billProgress.findMany({
        where: {
          submitSession: latestSubmitSession.submitSession
           // DietSessionInfoのリレーションではなくBillProgress自体を複数取得するため、numberでのフィルタリングは後で行う
        },
        take: 5,
        orderBy: {
          number: 'asc' // 法案番号でソート
        },
        include: {
          dietSessionInfo: true // DietSessionInfo情報も取得
        },
        distinct: ['number'] // 法案番号の重複を排除
      });
      console.log('サイドカラム用の法案データ:', sideBills);
    }
  } catch (error) {
    console.error('サイドカラム用の法案データの取得に失敗しました:', error);
  }

  // submittedDateを決定するヘルパー関数
  const getSubmittedDate = (billProgressEntries: BillProgress[] | null) => {
    if (!billProgressEntries || billProgressEntries.length === 0) {
      return "不明";
    }

    // billTypeが「衆法」でhouseReviewDateが存在するものをフィルタリング
    const filteredEntries = billProgressEntries.filter(entry =>
      entry.billType === '衆法' && entry.houseReviewDate !== null
    );

    if (filteredEntries.length === 0) {
      return "不明";
    }

    // sessionが最も小さいものでソート
    filteredEntries.sort((a, b) => a.session - b.session);

    // 最も小さいsessionのhouseReviewDateを返す
    return filteredEntries[0].houseReviewDate?.toLocaleDateString('ja-JP') || "不明";
  };

  // 注目の法案（最新の法案）
  const featuredBill = {
    id: mainBills[0] ? `bill-${mainBills[0].submitSession}-${mainBills[0].number}` : "不明",
    title: mainBills[0]?.billTitle || mainBills[0]?.dietSessionInfo?.title || "法案情報なし",
    summary: "法案の要約情報は現在準備中です。",
    status: mainBills[0]?.dietSessionInfo?.status || "不明",
    category: "デジタル", // ハードコーディング
    // submittedDateをBillProgressから取得するように変更
    // 該当法案番号のprogressを渡す際、findManyの結果からフィルタリングするのではなく、直接mainBills[0]を配列として渡す
    submittedDate: getSubmittedDate(mainBills[0] ? [mainBills[0]] : null),
    submittedBy: mainBills[0]?.submitter || "不明",
    curator: "政治ドットウォッチ編集部",
  }

  // 最新の法案（2番目以降の法案）
  const recentBills = mainBills.slice(1, 4).map(bill => ({
    id: `bill-${bill.submitSession}-${bill.number}`,
    title: bill.billTitle || bill.dietSessionInfo?.title || "法案情報なし",
    summary: "法案の要約情報は現在準備中です。",
    status: bill.dietSessionInfo?.status || "不明",
    category: "デジタル", // ハードコーディング
     // submittedDateをBillProgressから取得するように変更
    // 該当法案番号のprogressを渡す際、findManyの結果からフィルタリングするのではなく、直接billを配列として渡す
    submittedDate: getSubmittedDate([bill]),
    submittedBy: bill.submitter || "不明",
  }))

  // 人気の法案（サイドカラム用）
  const popularBills = sideBills.map(bill => ({
    id: `bill-${bill.submitSession}-${bill.number}`,
    title: bill.billTitle || bill.dietSessionInfo?.title || "法案情報なし",
    summary: "法案の要約情報は現在準備中です。",
    status: bill.dietSessionInfo?.status || "不明",
    category: "デジタル", // ハードコーディング
     // submittedDateをBillProgressから取得するように変更
    // 該当法案番号のprogressを渡す際、findManyの結果からフィルタリングするのではなく、直接billを配列として渡す
    submittedDate: getSubmittedDate([bill]),
    submitterParty: bill.submitterParty || "不明",
    submittedBy: bill.submitter || "不明",
    voteCount: Math.floor(Math.random() * 1000) + 500, // 仮の投票数
  }))

  // ユーザーの投票情報から、featuredBillへの投票を取得
  const featuredBillVote = userVotes.find((v) => v.billId === featuredBill.id)?.vote || null

  return (
    <div className="politics-dot-watch-container py-4 md:py-6">
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
                        {/* <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{bill.submittedBy}</span>
                        </div> */}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Landmark className="h-3 w-3" />
                        <span>{bill.submitterParty}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <User className="h-3 w-3" />
                        <span>{bill.submittedBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>{bill.submittedDate}</span>
                      </div>
                      {/* <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500">投票数:</span>
                        <span className="font-medium">{bill.voteCount}</span>
                      </div> */}
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

