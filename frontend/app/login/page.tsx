import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

interface LoginPageProps {
  searchParams: {
    tab?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("currentUser")

  // ユーザーがすでにログインしている場合はマイページにリダイレクト
  // if (userCookie) {
  //   redirect("/mypage")
  // }

  const activeTab = searchParams.tab === "register" ? "register" : "login"

  return (
    <div className="actpicks-container py-4 md:py-6">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          ホームに戻る
        </Link>

        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
            <TabsTrigger value="login" className="data-[state=active]:bg-white">
              ログイン
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white">
              新規登録
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h1 className="text-xl font-bold mb-1">ログイン</h1>
              <p className="text-gray-500 text-sm mb-6">アカウントにログインして、法案に投票しましょう</p>

              <LoginForm />
            </div>
          </TabsContent>

          <TabsContent value="register">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h1 className="text-xl font-bold mb-1">新規登録</h1>
              <p className="text-gray-500 text-sm mb-6">アカウントを作成して、法案に投票しましょう</p>

              <RegisterForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
