import { NextApiRequest, NextApiResponse } from "next"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { name, email, password } = req.body

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({
        error: "このメールアドレスは既に登録されています",
      })
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 12)

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    return res.status(201).json({
      message: "ユーザーが正常に作成されました",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({
      error: "ユーザーの作成に失敗しました",
    })
  }
} 