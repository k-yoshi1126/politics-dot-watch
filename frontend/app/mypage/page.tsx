import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Minus, User, Settings, Clock, ArrowLeft } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"

// 法案データ（実際のアプリではAPIから取得）
const billsData = [
  {
    id: "bill-2023-001",
    title: "デジタル社会形成基本法の一部を改正する法律案",
    summary:
      "デジタル社会の形成に関する施策を総合的かつ効果的に推進するため、デジタル社会形成基本法の一部を改正し、基本理念の追加、国の責務の明確化等を行う。",
    status: "審議中",
    category: "デジタル",
    submittedDate: "2023-10-15",
  },
  {
    id: "bill-2023-002",
    title: "地域における再生可能エネルギーの導入の促進に関する法律案",
    summary:
      "地域における再生可能エネルギーの導入を促進するため、市町村による再生可能エネルギー導入促進区域の指定、事業計画の認定制度等を創設する。",
    status: "可決",
    category: "環境",
    submittedDate: "2023-09-05",
  },
  {
    id: "bill-2023-003",
    title: "子ども・子育て支援法の一部を改正する法律案",
    summary:
      "子ども・子育て支援の充実を図るため、子ども・子育て支援法の一部を改正し、保育の質の向上、待機児童解消のための措置等を講ずる。",
    status: "審議中",
    category: "福祉",
    submittedDate: "2023-11-20",
  },
  {
    id: "bill-2023-004",
    title: "労働基準法の一部を改正する法律案",
    summary:
      "多様な働き方に対応するため、労働基準法の一部を改正し、フレックスタイム制の拡充、テレワークに関する規定の整備等を行う。",
    status: "審議中",
    category: "労働",
    submittedDate: "2023-12-01",
  },
]

export default async function MyPage() {
  console.log("[DEBUG] マイページへ来ました。")

  const session = await getServerSession(authOptions)
  console.log("[DEBUG] セッション状態:", {
    hasSession: !!session,
    userId: session?.user?.id,
  })

  // ユーザーがログインしていない場合はログインページにリダイレクト
  if (!session?.user) {
    console.log("[DEBUG] ユーザーがログインしていないため、ログインページにリダイレクトします")
    redirect("/login")
  }

  const currentUser = session.user

  // // ユーザーの投票履歴を取得
  // const userVotes = getUserVotes(currentUser.id)

  // 投票した法案の詳細情報を取得
  // const votedBills = userVotes
  //   .map((vote) => {
  //     const bill = billsData.find((b) => b.id === vote.billId)
  //     return bill
  //       ? {
  //           ...bill,
  //           voteType: vote.vote,
  //           voteDate: vote.createdAt,
  //         }
  //       : null
  //   })
  //   .filter(Boolean) // nullを除外

  // 投票タイプに応じたアイコンとラベルを取得
  const getVoteInfo = (voteType: string) => {
    switch (voteType) {
      case "agree":
        return { icon: <ThumbsUp className="h-4 w-4" />, label: "賛成", color: "bg-primary" }
      case "disagree":
        return { icon: <ThumbsDown className="h-4 w-4" />, label: "反対", color: "bg-destructive" }
      case "abstain":
        return { icon: <Minus className="h-4 w-4" />, label: "棄権", color: "bg-secondary" }
      default:
        return { icon: null, label: "", color: "" }
    }
  }

  return (
    <div className="actpicks-container py-4 md:py-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          ホームに戻る
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">マイページ</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <User className="h-4 w-4" />
              <span>{currentUser.name}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href="/mypage/settings">
              <Settings className="h-3 w-3 mr-1" />
              設定
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="votes" className="mb-8">
          <TabsList className="mb-4 bg-transparent border-b border-gray-200 w-full justify-start gap-4 p-0 h-auto">
            <TabsTrigger
              value="votes"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              投票履歴
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="text-sm data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent px-1 py-2 rounded-none"
            >
              プロフィール
            </TabsTrigger>
          </TabsList>

          <TabsContent value="votes" className="mt-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-bold mb-4">投票履歴</h2>

              {/* {votedBills.length > 0 ? (
                <div className="space-y-0">
                  {votedBills.map((bill: any) => {
                    const voteInfo = getVoteInfo(bill.voteType)
                    return (
                      <div key={bill.id} className="bill-card">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <Badge
                            variant={
                              bill.status === "可決" ? "default" : bill.status === "審議中" ? "secondary" : "outline"
                            }
                            className={bill.status === "可決" ? "bg-primary hover:bg-primary/90" : ""}
                          >
                            {bill.status}
                          </Badge>
                          <Badge
                            variant={
                              bill.voteType === "agree"
                                ? "default"
                                : bill.voteType === "disagree"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="flex items-center gap-1"
                          >
                            {voteInfo.icon}
                            {voteInfo.label}
                          </Badge>
                        </div>
                        <h3 className="font-bold mb-2">
                          <Link href={`/bills/${bill.id}`} className="hover:text-primary transition-colors">
                            {bill.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{bill.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>投票日: {bill.voteDate}</span>
                          </div>
                          <Badge variant="outline" className="text-xs font-normal">
                            {bill.category}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">まだ投票した法案はありません</p>
                  <Button asChild>
                    <Link href="/bills">法案一覧を見る</Link>
                  </Button>
                </div>
              )} */}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-bold mb-4">プロフィール</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">ユーザー名</h3>
                    <p className="font-medium">{currentUser.name}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">メールアドレス</h3>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">登録日</h3>
                    <p className="font-medium">
                      {currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "不明"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500">投票数</h3>
                    {/* <p className="font-medium">{userVotes.length}件</p> */}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">投票統計</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1 text-primary">
                        <ThumbsUp className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium">
                        賛成: {userVotes.filter((v) => v.vote === "agree").length}件
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1 text-red-500">
                        <ThumbsDown className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium">
                        反対: {userVotes.filter((v) => v.vote === "disagree").length}件
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="flex justify-center mb-1 text-gray-500">
                        <Minus className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium">
                        棄権: {userVotes.filter((v) => v.vote === "abstain").length}件
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
