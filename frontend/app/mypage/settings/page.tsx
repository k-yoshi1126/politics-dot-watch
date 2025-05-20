import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("currentUser")

  // ユーザーがログインしていない場合はログインページにリダイレクト
  if (!userCookie) {
    redirect("/login")
  }

  const currentUser = JSON.parse(userCookie.value)

  return (
    <div className="newspicks-container py-4 md:py-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/mypage" className="text-sm text-primary hover:underline mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          マイページに戻る
        </Link>
        <h1 className="text-2xl font-bold mb-2">アカウント設定</h1>
        <p className="text-gray-500 mb-6">アカウント情報や通知設定を変更できます</p>

        <SettingsForm currentUser={currentUser} />
      </div>
    </div>
  )
}
