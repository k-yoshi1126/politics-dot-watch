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

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRegisterError("")

    // パスワード確認
    if (password !== confirmPassword) {
      setRegisterError("パスワードが一致しません")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "登録完了",
          description: "アカウントが正常に作成されました",
        })

        // マイページに遷移
        router.push("/mypage")
        router.refresh()
      } else {
        setRegisterError(data.message || "登録処理中にエラーが発生しました")
      }
    } catch (error) {
      setRegisterError("登録処理中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister}>
      {registerError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{registerError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-name">ニックネーム</Label>
          <Input
            id="register-name"
            type="text"
            required
            className="h-10 border-gray-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">メールアドレス</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="your@email.com"
            required
            className="h-10 border-gray-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">パスワード</Label>
          <Input
            id="register-password"
            type="password"
            required
            className="h-10 border-gray-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password-confirm">パスワード（確認）</Label>
          <Input
            id="register-password-confirm"
            type="password"
            required
            className="h-10 border-gray-200"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "登録中..." : "登録"}
        </Button>
      </div>
    </form>
  )
}
