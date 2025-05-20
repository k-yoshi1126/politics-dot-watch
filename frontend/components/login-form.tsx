"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    try {
      console.log("[DEBUG] ログイン処理開始")
      console.log("[DEBUG] ログイン試行:", { email })
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("[DEBUG] レスポンス受信:", response.status)
      const data = await response.json()
      console.log("[DEBUG] ログインレスポンス:", data)

      if (data.success) {
        console.log("[DEBUG] ログイン成功")
        toast({
          title: "ログイン成功",
          description: `ようこそ、${data.user.name}さん`,
        })

        console.log("[DEBUG] マイページへの遷移を試みます")
        try {
          await router.push("/mypage")
          console.log("[DEBUG] マイページへの遷移が完了しました")
        } catch (error) {
          console.error("[DEBUG] マイページへの遷移中にエラーが発生:", error)
        }
        router.refresh()
      } else {
        console.error("[DEBUG] ログインエラー:", data.message)
        setLoginError(data.message || "メールアドレスまたはパスワードが正しくありません")
      }
    } catch (error) {
      console.error("[DEBUG] ログイン例外:", error)
      setLoginError("ログイン処理中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => {
      console.log("[DEBUG] フォーム送信イベント発火")
      handleLogin(e)
    }}>
      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            required
            className="h-10 border-gray-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">パスワード</Label>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
              パスワードを忘れた場合
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            required
            className="h-10 border-gray-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">テスト用アカウント:</p>
          <p>メール: test@example.com</p>
          <p>パスワード: password123</p>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "ログイン中..." : "ログイン"}
        </Button>
      </div>
    </form>
  )
}
