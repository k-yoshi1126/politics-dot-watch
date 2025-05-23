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
import { signIn } from "next-auth/react"

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

    console.log("[DEBUG] Login attempt with:", {
      email,
      hasPassword: !!password,
    })

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("[DEBUG] SignIn result:", result)

      if (result?.error) {
        console.log("[DEBUG] Login error:", result.error)
        setLoginError("メールアドレスまたはパスワードが正しくありません")
      } else {
        console.log("[DEBUG] Login successful, redirecting to /mypage")
        toast({
          title: "ログイン成功",
          description: "ようこそ戻ってきました",
        })
        router.push("/mypage")
        router.refresh()
      }
    } catch (error) {
      console.error("[DEBUG] Login error:", error)
      setLoginError("ログイン処理中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
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
