import Link from "next/link"
// import { useSearchParams } from "next/navigation"

const categories = [
  { id: "all", name: "全てのカテゴリ" },
  { id: "economy", name: "経済" },
  { id: "welfare", name: "福祉" },
  { id: "education", name: "教育" },
  { id: "environment", name: "環境" },
  { id: "security", name: "安全保障" },
  { id: "labor", name: "労働" },
  { id: "digital", name: "デジタル" },
]

function useSearchParams() {
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search)
  }
  return new URLSearchParams()
}


export function CategoryTabs() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

  const isCategoryActive = (category: string | null) => {
    if (category === "all") {
      return !currentCategory || currentCategory === "all"
    }
    return currentCategory === category
  }

  return (
    <div className="hidden md:block">
      <div className="pb-3">
        <div className="flex overflow-x-auto py-1 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/bills?category=${category.id}`}
              className={`whitespace-nowrap px-2 py-2 text-sm ${
                isCategoryActive(category.id) ? "tab-active" : "text-gray-600"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MobileCategoryTabs() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

  const isCategoryActive = (category: string | null) => {
    if (category === "all") {
      return !currentCategory || currentCategory === "all"
    }
    return currentCategory === category
  }

  return (
    <div className="md:hidden overflow-x-auto flex py-2 mb-4 gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/bills?category=${category.id}`}
          className={`category-pill ${
            isCategoryActive(category.id) ? "bg-primary text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}