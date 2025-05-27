'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { Menu, User, Home, Search, MessageCircleQuestion, LogOut, UserPlus } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    console.log("[Header DEBUG] Session status:", status);
    console.log("[Header DEBUG] Session data:", session);
    
    if (status === "authenticated" && session?.user) {
      setIsLoggedIn(true)
      setUserName(session.user.name || "")
      console.log("[Header DEBUG] User authenticated:", session.user.name);
    } else {
      setIsLoggedIn(false)
      setUserName("")
      console.log("[Header DEBUG] User not authenticated");
    }
  }, [status, session])

  const handleLogout = async () => {
    console.log("[Header DEBUG] Logging out...");
    await signOut({ redirect: false })
    setIsLoggedIn(false)
    setUserName("")
    console.log("[Header DEBUG] Signed out, redirecting to /login");
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="politics-dot-watch-header">
      <div className="politics-dot-watch-container">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-bold no-underline flex items-center">
              <span className="text-primary">政治</span>ドットウォッチ
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className={`text-sm ${isActive("/") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
              >
                ホーム
              </Link>
              <Link
                href="/bills"
                className={`text-sm ${isActive("/bills") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
              >
                法案検索
              </Link>
              <Link
                href="/faq"
                className={`text-sm ${isActive("/faq") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
              >
                よくある質問
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/mypage">
                      マイページ
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">
                      ログイン
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/register">
                      新規登録
                    </Link>
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 md:hidden">
              {!isLoggedIn && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    ログイン
                  </Link>
                </Button>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">メニューを開く</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col gap-4">
                    {isLoggedIn ? (
                      <SheetClose asChild>
                        <Link href="/mypage" className="flex items-center gap-2 text-sm text-gray-600 no-underline">
                          <User className="h-4 w-4" />
                          マイページ
                        </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                         <Link href="/register" className="flex items-center gap-2 stext-sm text-gray-600 no-underline">
                          <UserPlus className="h-4 w-4" />
                           新規登録
                         </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`flex items-center gap-2 text-sm ${isActive("/") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
                      >
                        <Home className="h-4 w-4" />
                        ホーム
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/bills"
                        className={`flex items-center gap-2 text-sm ${isActive("/bills") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
                      >
                        <Search className="h-4 w-4" />
                        法案検索
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/faq"
                        className={`flex items-center gap-2 text-sm ${isActive("/faq") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
                      >
                        <MessageCircleQuestion className="h-4 w-4" />
                        よくある質問
                      </Link>
                    </SheetClose>
                    {isLoggedIn && (
                      <SheetClose asChild>
                        <Button variant="ghost" className="flex items-center gap-2 justify-start px-0 text-sm text-gray-600" onClick={handleLogout}>
                          <LogOut className="h-4 w-4" />
                          ログアウト
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* <CategoryTabs /> */}
    </header>
  )
}

// function CategoryTabs() {
//   const searchParams = useSearchParams()
//   const currentCategory = searchParams.get("category")

//   const isCategoryActive = (category: string | null) => {
//     if (category === "all") {
//       return !currentCategory || currentCategory === "all"
//     }
//     return currentCategory === category
//   }

//   return (
//     <div className="hidden md:block border-t border-gray-200">
//       <div className="politics-dot-watch-container">
//         <div className="flex overflow-x-auto py-1 gap-4">
//           <Link
//             href="/bills?category=all"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("all") ? "tab-active" : "text-gray-600"}`}
//           >
//             総合
//           </Link>
//           <Link
//             href="/bills?category=economy"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("economy") ? "tab-active" : "text-gray-600"}`}
//           >
//             経済
//           </Link>
//           <Link
//             href="/bills?category=welfare"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("welfare") ? "tab-active" : "text-gray-600"}`}
//           >
//             福祉
//           </Link>
//           <Link
//             href="/bills?category=education"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("education") ? "tab-active" : "text-gray-600"}`}
//           >
//             教育
//           </Link>
//           <Link
//             href="/bills?category=environment"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("environment") ? "tab-active" : "text-gray-600"}`}
//           >
//             環境
//           </Link>
//           <Link
//             href="/bills?category=security"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("security") ? "tab-active" : "text-gray-600"}`}
//           >
//             安全保障
//           </Link>
//           <Link
//             href="/bills?category=labor"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("labor") ? "tab-active" : "text-gray-600"}`}
//           >
//             労働
//           </Link>
//           <Link
//             href="/bills?category=digital"
//             className={`whitespace-nowrap px-2 py-2 text-sm ${isCategoryActive("digital") ? "tab-active" : "text-gray-600"}`}
//           >
//             デジタル
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

// function useSearchParams() {
//   if (typeof window !== "undefined") {
//     return new URLSearchParams(window.location.search)
//   }
//   return new URLSearchParams()
// }
