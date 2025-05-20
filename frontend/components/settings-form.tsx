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

interface SettingsFormProps {
  currentUser: any
}

export function SettingsForm({ currentUser }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    emailNotifications: true,
    marketingEmails: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 実際の実装ではAPIを呼び出して設定を保存します
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "設定を保存しました",
        description: "アカウント設定が正常に更新されました",
      })
      router.refresh()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-gray-200 mb-6">
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
          <CardDescription>あなたの基本情報を編集できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ユーザー名</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-10 border-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-10 border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 mb-6">
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <CardDescription>通知の受け取り方を設定できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">メール通知</Label>
              <p className="text-sm text-gray-500">新しい法案や投票結果の通知を受け取る</p>
            </div>
            <Switch
              id="email-notifications"
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => handleSwitchChange("emailNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">マーケティングメール</Label>
              <p className="text-sm text-gray-500">サービスの更新情報やニュースレターを受け取る</p>
            </div>
            <Switch
              id="marketing"
              checked={formData.marketingEmails}
              onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 mb-6">
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
          <CardDescription>アカウントのパスワードを変更できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">現在のパスワード</Label>
            <Input id="current-password" type="password" className="h-10 border-gray-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新しいパスワード</Label>
            <Input id="new-password" type="password" className="h-10 border-gray-200" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
            <Input id="confirm-password" type="password" className="h-10 border-gray-200" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/mypage">キャンセル</Link>
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            "変更を保存"
          )}
        </Button>
      </div>
    </form>
  )
}
