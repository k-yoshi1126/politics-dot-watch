"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface VoteButtonsProps {
  billId: string
  compact?: boolean
  initialVote?: "agree" | "disagree" | null
}

export function VoteButtons({ billId, compact = false, initialVote = null }: VoteButtonsProps) {
  const { data: session } = useSession()
  const currentUser = session?.user
  const [vote, setVote] = useState<"agree" | "disagree" | "abstain" | null>(
    initialVote as "agree" | "disagree" | "abstain" | null,
  )
  const { toast } = useToast()
  const router = useRouter()

  // 投票数のモックデータ
  const [voteStats, setVoteStats] = useState({
    agree: Math.floor(Math.random() * 100) + 20,
    disagree: Math.floor(Math.random() * 50) + 10,
    abstain: Math.floor(Math.random() * 30) + 5,
  })

  const handleVote = async (voteType: "agree" | "disagree" | "abstain") => {
    if (!currentUser) {
      // ログインしていない場合はログインページに遷移
      toast({
        title: "ログインが必要です",
        description: "投票するにはログインしてください",
      })
      router.push("/login")
      return
    }

    try {
      // 投票の切り替え処理
      if (vote === voteType) {
        // 同じボタンを押した場合は投票を取り消す
        await fetch(`/api/votes?billId=${billId}`, {
          method: "DELETE",
        })

        setVote(null)
        // 投票数を減らす
        setVoteStats((prev) => ({
          ...prev,
          [voteType]: prev[voteType] - 1,
        }))

        toast({
          title: "投票を取り消しました",
          description: "投票を取り消しました",
        })
      } else {
        // 投票をAPIに送信
        await fetch("/api/votes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billId,
            voteType,
          }),
        })

        // 前の投票があれば、その投票数を減らす
        if (vote) {
          setVoteStats((prev) => ({
            ...prev,
            [vote]: prev[vote] - 1,
          }))
        }

        // 新しい投票をセット
        setVote(voteType)
        // 投票数を増やす
        setVoteStats((prev) => ({
          ...prev,
          [voteType]: prev[voteType] + 1,
        }))

        toast({
          title: "投票しました",
          description: `法案に${voteType === "agree" ? "賛成" : voteType === "disagree" ? "反対" : "棄権"}の投票を行いました。`,
        })
      }

      // サーバーコンポーネントを再検証
      router.refresh()
    } catch (error) {
      toast({
        title: "エラーが発生しました",
        description: "投票処理中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  if (!currentUser) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size={compact ? "sm" : "default"} disabled>
          <ThumbsUp className="h-4 w-4 mr-2" />
          賛成
        </Button>
        <Button variant="outline" size={compact ? "sm" : "default"} disabled>
          <ThumbsDown className="h-4 w-4 mr-2" />
          反対
        </Button>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleVote("agree")}
          className={`vote-button ${vote === "agree" ? "text-primary" : "text-gray-500"}`}
        >
          <ThumbsUp className="h-3 w-3" />
          <span className="vote-count">{voteStats.agree}</span>
        </button>
        <button
          onClick={() => handleVote("disagree")}
          className={`vote-button ${vote === "disagree" ? "text-red-500" : "text-gray-500"}`}
        >
          <ThumbsDown className="h-3 w-3" />
          <span className="vote-count">{voteStats.disagree}</span>
        </button>
        <button
          onClick={() => handleVote("abstain")}
          className={`vote-button ${vote === "abstain" ? "text-gray-700" : "text-gray-500"}`}
        >
          <Minus className="h-3 w-3" />
          <span className="vote-count">{voteStats.abstain}</span>
        </button>
      </div>
    )
  }

  return (
    <div
      /* ① モバイルは縦並び、sm 以上は横並び */
      className="flex flex-col sm:flex-row gap-2 w-full"
    >
      <Button
        variant={vote === "agree" ? "default" : "outline"}
        size="sm"
        className={`h-8 text-xs w-full sm:flex-1 ${vote === "agree" ? "bg-primary hover:bg-primary/90" : ""}`}
        onClick={() => handleVote("agree")}
      >
        <ThumbsUp className="h-3 w-3 mr-1" />
        賛成
        <span className="ml-1">({voteStats.agree})</span>
      </Button>
      <Button
        variant={vote === "disagree" ? "destructive" : "outline"}
        size="sm"
        className="h-8 text-xs w-full sm:flex-1"
        onClick={() => handleVote("disagree")}
      >
        <ThumbsDown className="h-3 w-3 mr-1" />
        反対
        <span className="ml-1">({voteStats.disagree})</span>
      </Button>
      <Button
        variant={vote === "abstain" ? "secondary" : "outline"}
        size="sm"
        className="h-8 text-xs w-full sm:flex-1"
        onClick={() => handleVote("abstain")}
      >
        <Minus className="h-3 w-3 mr-1" />
        棄権
        <span className="ml-1">({voteStats.abstain})</span>
      </Button>
    </div>
  )
}
