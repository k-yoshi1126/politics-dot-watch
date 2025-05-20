"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu, X, User, Search, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface ClientSideHeaderProps {
  currentUser: any | null
}

export function ClientSideHeader({ currentUser }: ClientSideHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const isActive = (path: string) => {
    return pathname === path
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (isSearchOpen) setIsSearchOpen(false)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isMenuOpen) setIsMenuOpen(false)
  }

  const handleLogout = () => {
    // サーバーサイドでCookieを削除するAPIを呼び出す
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      router.push("/")
      router.refresh()
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/bills?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
    }
  }

  return (
    <>
      {/* Mobile icons */}
      <div className="flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSearch} className="text-gray-600">
          <Search className="h-5 w-5" />
        </Button>
        {currentUser && (
          <Button variant="ghost" size="icon" asChild className="text-gray-600">
            <Link href="/mypage">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-gray-600">
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-4">
        <nav className="flex items-center">
          <Link
            href="/"
            className={`px-3 py-2 text-sm ${
              isActive("/") ? "text-primary font-medium" : "text-gray-600"
            } no-underline hover:text-primary transition-colors`}
          >
            ホーム
          </Link>
          <Link
            href="/bills"
            className={`px-3 py-2 text-sm ${
              isActive("/bills") ? "text-primary font-medium" : "text-gray-600"
            } no-underline hover:text-primary transition-colors`}
          >
            法案検索
          </Link>
          <Link
            href="/faq"
            className={`px-3 py-2 text-sm ${
              isActive("/faq") ? "text-primary font-medium" : "text-gray-600"
            } no-underline hover:text-primary transition-colors`}
          >
            よくある質問
          </Link>
        </nav>

        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="icon" onClick={toggleSearch} className="text-gray-600">
            <Search className="h-5 w-5" />
          </Button>

          {currentUser ? (
            <>
              <Button variant="ghost" size="icon" asChild className="text-gray-600">
                <Link href="/mypage">
                  <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/mypage">マイページ</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mypage/settings">設定</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>ログアウト</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-gray-600">
                <Link href="/login">ログイン</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                <Link href="/login?tab=register">新規登録</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      {isSearchOpen && (
        <div className="py-2 border-t border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="search"
              placeholder="法案を検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
            <Button type="submit" size="sm" className="h-9">
              検索
            </Button>
          </form>
        </div>
      )}

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav className="py-4 border-t border-gray-200 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className={`text-sm ${isActive("/") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link
              href="/bills"
              className={`text-sm ${isActive("/bills") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
              onClick={() => setIsMenuOpen(false)}
            >
              法案検索
            </Link>
            <Link
              href="/faq"
              className={`text-sm ${isActive("/faq") ? "text-primary font-medium" : "text-gray-600"} no-underline`}
              onClick={() => setIsMenuOpen(false)}
            >
              よくある質問
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/mypage"
                  className="text-sm text-gray-600 no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
                <Link
                  href="/mypage/settings"
                  className="text-sm text-gray-600 no-underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  設定
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="mt-2">
                  ログアウト
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" asChild className="flex-1">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    ログイン
                  </Link>
                </Button>
                <Button size="sm" asChild className="flex-1 bg-primary hover:bg-primary/90">
                  <Link href="/login?tab=register" onClick={() => setIsMenuOpen(false)}>
                    新規登録
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      )}
    </>
  )
}
