"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"

interface SearchProps {
  redirectPath?: string
}

export function Search({ redirectPath = "/bills" }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`${redirectPath}?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          placeholder="法案名、キーワード"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20 h-11 bg-white border-gray-200 focus:border-primary"
        />
        <Button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-4 bg-primary hover:bg-primary/90"
        >
          検索
        </Button>
      </div>
    </form>
  )
}
