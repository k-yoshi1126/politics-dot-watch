import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 法案カテゴリに基づいて画像パスを取得する関数
export function getBillImagePath(category: string): string {
  const categoryMap: Record<string, string> = {
    デジタル: "/images/digital.png",
    環境: "/images/environment.png",
    福祉: "/images/welfare.png",
    教育: "/images/education.png",
    労働: "/images/labor.png",
    経済: "/images/economy.png",
    地方: "/images/local.png",
    安全保障: "/images/security.png",
  }

  return categoryMap[category] || "/images/default.png"
}
