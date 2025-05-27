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

interface BillPageProps {
  params: {
    id: string
  }
}

export default function BillPage({ params }: BillPageProps) {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("currentUser")
  const currentUser = userCookie ? JSON.parse(userCookie.value) : null

  // ユーザーの投票情報を取得
  const userVotes = currentUser ? getUserVotes(currentUser.id) : []

  // この法案への投票を取得
  const billVote = (userVotes.find((v) => v.billId === params.id)?.vote || null) as "agree" | "disagree" | null

  // 実際の実装ではAPIからデータを取得します
  const bill = {
    id: params.id,
    title: "デジタル社会形成基本法の一部を改正する法律案",
    summary:
      "デジタル社会の形成に関する施策を総合的かつ効果的に推進するため、デジタル社会形成基本法の一部を改正し、基本理念の追加、国の責務の明確化等を行う。",
    status: "審議中",
    category: "デジタル",
    submittedDate: "2023-10-15",
    submittedBy: "内閣",
    fullText: `
      第一条 デジタル社会形成基本法（令和三年法律第三十五号）の一部を次のように改正する。
      
      目次中「第四章 基本的施策（第十七条―第三十条）」を「第四章 基本的施策（第十七条―第三十一条）」に改める。
      
      第二条に次の一項を加える。
      ２ この法律において「デジタルファースト」とは、個人又は法人の手続について、デジタル技術を活用して行うことを基本とすることをいう。
      
      第三条第五項中「並びに」を「、」に改め、「推進されなければならない」の下に「、並びにデジタルファーストの原則が適切に実現されなければならない」を加える。
      
      第四条第二項中「前項」を「第一項」に改め、同項を同条第三項とし、同条第一項の次に次の一項を加える。
      ２ 国は、デジタル社会の形成に関する施策を総合的に策定し、及び実施する責務を有する。
    `,
    aiSummary: `
      この法案は、デジタル社会形成基本法を改正し、以下の変更を行うものです：

      1. 「デジタルファースト」の概念を新たに定義（第二条）
      2. デジタルファーストの原則を基本理念に追加（第三条）
      3. デジタル社会形成に関する国の責務を明確化（第四条）
      4. 基本的施策の範囲を拡大（目次の改正）

      この改正により、行政手続きや各種サービスにおいて、デジタル技術を活用した方法を基本とする「デジタルファースト」の原則が法的に位置づけられ、国がデジタル社会形成に関する施策を総合的に策定・実施する責務が明確化されます。
    `,
    impactAreas: [
      "行政手続きのデジタル化が加速",
      "オンライン申請が原則となる可能性",
      "デジタル格差（デジタルディバイド）への対応が課題に",
      "国のデジタル政策の責任範囲が拡大",
    ],
    timeline: [
      { date: "2023-10-15", event: "法案提出" },
      { date: "2023-11-05", event: "衆議院本会議で趣旨説明" },
      { date: "2023-11-10", event: "衆議院デジタル社会形成基本法案審査小委員会で審査" },
      { date: "2023-11-20", event: "衆議院本会議で可決" },
      { date: "2023-12-01", event: "参議院デジタル社会特別委員会で審査中" },
    ],
    relatedBills: [
      { id: "bill-2023-007", title: "デジタル手続法の一部を改正する法律案", category: "デジタル" },
      { id: "bill-2023-008", title: "マイナンバー法の一部を改正する法律案", category: "デジタル" },
    ],
    commentCount: 24,
    bookmarkCount: 156,
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
            variant={bill.status === "可決" ? "default" : bill.status === "審議中" ? "secondary" : "outline"}
            className={bill.status === "可決" ? "bg-primary hover:bg-primary/90" : ""}
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
              法案全文
            </TabsTrigger>
            <TabsTrigger
              value="impact"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              影響範囲
            </TabsTrigger>
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
              <h2 className="text-lg font-bold mb-4">法案全文</h2>
              <div className="whitespace-pre-line text-gray-600 font-mono text-sm leading-relaxed">{bill.fullText}</div>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">影響範囲</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                {bill.impactAreas.map((impact, index) => (
                  <li key={index}>{impact}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold mb-4">審議状況</h2>
              <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-4">
                {bill.timeline.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[1.7rem] top-1.5"></div>
                    <p className="font-medium text-sm">{item.date}</p>
                    <p className="text-gray-600 text-sm">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
      </div>
    </div>
  )
}
