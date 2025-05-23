"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // 新規登録とログインを同時に行う
      const result = await signIn("credentials", {
        name,
        email,
        password,
        redirect: false,
        callbackUrl: "/mypage"
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success("アカウントを作成しました")
      router.push("/mypage")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登録に失敗しました")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">お名前</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="山田 太郎"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="example@example.com"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="8文字以上"
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "登録中..." : "新規登録"}
      </Button>
    </form>
  )
}
