import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoteButtons } from "@/components/vote-buttons"
import Link from "next/link"
import Image from "next/image"
import { Share2, Calendar, Building, ArrowLeft, MessageSquare, Bookmark } from "lucide-react"
import { cookies } from "next/headers"
import { getUserVotes } from "@/lib/auth"
import { getBillImagePath } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface BillPageProps {
  params: {
    id: string
  }
}

export default async function BillPage({ params }: BillPageProps) {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("currentUser")
  const currentUser = userCookie ? JSON.parse(userCookie.value) : null

  // ユーザーの投票情報を取得
  const userVotes = currentUser ? getUserVotes(currentUser.id) : []

  // この法案への投票を取得
  const billVote = (userVotes.find((v) => v.billId === params.id)?.vote || null) as "agree" | "disagree" | null

  // 法案IDから提出国会回次と番号を抽出
  const billIdParts = params.id.replace('bill-', '').split('-')
  if (billIdParts.length !== 2) {
    console.error('Invalid bill ID format:', params.id)
    notFound()
  }

  const [submitSession, number] = billIdParts.map(Number)
  if (isNaN(submitSession) || isNaN(number)) {
    console.error('Invalid bill ID numbers:', { submitSession, number })
    notFound()
  }

  console.log('Fetching bill with params:', { submitSession, number })

  // データベースから法案データを取得
  const dbBill = await prisma.billProgress.findFirst({
    where: {
      submitSession: submitSession,
      number: number
    },
    include: {
      dietSessionInfo: true
    }
  })

  if (!dbBill) {
    console.error('Bill not found:', { submitSession, number })
    notFound()
  }

  // 法案の本文を取得
  const billContent = await prisma.billSubmitContent.findUnique({
    where: {
      submitSession_number: {
        submitSession: submitSession,
        number: number
      }
    }
  })

  // 法案の審議履歴を取得
  const billHistory = await prisma.dietSessionInfo.findMany({
    where: {
      submitSession: submitSession,
      number: number
    },
    orderBy: {
      session: 'asc'
    }
  })

  // BillProgressから提出日を探す
  const billProgressEntries = await prisma.billProgress.findMany({
    where: {
      submitSession: submitSession,
      number: number,
      billType: '衆法',
      houseReviewDate: { not: null }
    },
    orderBy: {
      session: 'asc'
    }
  })

  const submittedDateFromProgress = billProgressEntries.length > 0
    ? billProgressEntries[0].houseReviewDate?.toLocaleDateString('ja-JP')
    : null

  console.log('Found bill:', dbBill)
  console.log('Found bill content:', billContent)
  console.log('Found bill history:', billHistory)
  console.log('Found bill progress entries for submittedDate:', billProgressEntries)

  // 法案データを整形
  const bill = {
    id: params.id,
    title: dbBill.billTitle || "法案のタイトルは現在準備中です。",
    summary: "法案の要約情報は現在準備中です。",
    status: dbBill.dietSessionInfo?.status || "不明",
    category: "不明",
    submittedDate: submittedDateFromProgress || "不明",
    submittedBy: dbBill.submitter || "不明",
    submitterParty: dbBill.submitterParty || "不明",
    fullText: billContent?.content || "法案の全文は現在準備中です。",
    supplementaryProvisions: billContent?.supplementaryProvisions || "法案の附則は現在準備中です。",
    reason: billContent?.reason || "法案の理由は現在準備中です。",
    aiSummary: "AIによる要約は現在準備中です。",
    impactAreas: [
      "影響範囲の分析は現在準備中です。",
    ],
    timeline: billHistory.map(history => ({
      date: `第${history.session}回国会`,
      event: history.status || "不明"
    })),
    relatedBills: [] as { id: string; title: string; category: string }[],
    commentCount: 0,
    bookmarkCount: 0,
  }

  return (
    <div className="politics-dot-watch-container py-4 md:py-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/bills" className="text-sm text-primary hover:underline mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          法案一覧に戻る
        </Link>

        <div className="flex flex-wrap gap-2 mb-3">
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

        <h1 className="text-2xl font-bold mb-4">{bill.title}</h1>

        {/* 法案イメージ画像 */}
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={`/naikaku.jpg?height=450&width=800`}
            alt={`${bill.category}のイメージ`}
            width={800}
            height={450}
            className="w-full h-auto object-cover"
          />
        </div>

        <p className="text-gray-600 text-sm mb-4">{bill.summary}</p>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              提出日: {bill.submittedDate}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Building className="h-4 w-4 mr-2" />
              提出者: {bill.submittedBy}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Building className="h-4 w-4 mr-2" />
              提出会派: {bill.submitterParty}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              共有
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Bookmark className="h-3 w-3 mr-1" />
              保存
              <span className="ml-1">({bill.bookmarkCount})</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              コメント
              <span className="ml-1">({bill.commentCount})</span>
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <VoteButtons billId={bill.id} initialVote={billVote} />
        </div>

        <Tabs defaultValue="summary" className="mb-8">
          <TabsList className="mb-4 bg-transparent border-b border-gray-200 w-full justify-start gap-4 p-0 h-auto">
            <TabsTrigger
              value="summary"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              AI要約
            </TabsTrigger>
            <TabsTrigger
              value="full-text"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              改正内容
            </TabsTrigger>
            <TabsTrigger
              value="supplementary-provisions"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              附則
            </TabsTrigger>
            <TabsTrigger
              value="reason"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              理由
            </TabsTrigger>
            {/* <TabsTrigger
              value="impact"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              影響範囲
            </TabsTrigger> */}
            <TabsTrigger
              value="timeline"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              審議状況
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">AI要約</h2>
              <div className="whitespace-pre-line text-gray-600 text-sm leading-relaxed">{bill.aiSummary}</div>
            </div>
          </TabsContent>

          <TabsContent value="full-text" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">改正内容</h2>
              <div className="whitespace-pre-line text-gray-600 font-mono text-sm leading-relaxed">{bill.fullText}</div>
            </div>
          </TabsContent>

          <TabsContent value="supplementary-provisions" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">附則</h2>
              <div className="whitespace-pre-line text-gray-600 font-mono text-sm leading-relaxed">{bill.supplementaryProvisions}</div>
            </div>
          </TabsContent>

          <TabsContent value="reason" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">理由</h2>
              <div className="whitespace-pre-line text-gray-600 font-mono text-sm leading-relaxed">{bill.reason}</div>
            </div>
          </TabsContent>

          {/* <TabsContent value="impact" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">影響範囲</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                {bill.impactAreas.map((impact, index) => (
                  <li key={index}>{impact}</li>
                ))}
              </ul>
            </div>
          </TabsContent> */}

          <TabsContent value="timeline" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">審議状況</h2>
              <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-4">
                {bill.timeline.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[1.5rem] top-1.5"></div>
                    <p className="font-medium text-sm">{item.date}</p>
                    <p className="text-gray-600 text-sm">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* {bill.relatedBills.length > 0 && (
          <div>
            <h2 className="section-title">関連法案</h2>
            <div className="space-y-4">
              {bill.relatedBills.map((relatedBill) => (
                <div
                  key={relatedBill.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={`/naikaku.jpg?height=450&width=800`}
                        alt={`${relatedBill.category}のイメージ`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Link
                      href={`/bills/${relatedBill.id}`}
                      className="font-medium hover:text-primary transition-colors text-sm"
                    >
                      {relatedBill.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}
