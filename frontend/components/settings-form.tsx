"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

export function SettingsForm() {
  const { data: session, update } = useSession()
  const { toast } = useToast()

  if (!session?.user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    try {
      // ユーザー情報を更新
      await update({
        ...session,
        user: {
          ...session.user,
          name,
          email,
        },
      })

      toast({
        title: "設定を更新しました",
        description: "アカウント情報が正常に更新されました。",
      })
    } catch (error) {
      console.error("設定の更新に失敗しました:", error)
      toast({
        title: "エラーが発生しました",
        description: "設定の更新に失敗しました。もう一度お試しください。",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">名前</Label>
        <Input
          id="name"
          name="name"
          defaultValue={session.user.name || ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={session.user.email || ""}
          required
        />
      </div>
      <Button type="submit">設定を保存</Button>
    </form>
  )
}
