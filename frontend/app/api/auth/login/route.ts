import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("ログインリクエスト受信:", { email })

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
    })
    console.log("ユーザー検索結果:", user ? "ユーザーが見つかりました" : "ユーザーが見つかりません")

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    if (!user.password) {
      console.error("パスワードが設定されていません:", { userId: user.id })
      return NextResponse.json(
        { error: "パスワードが設定されていません" },
        { status: 400 }
      )
    }

    // パスワードを検証
    const isValid = await compare(password, user.password)
    console.log("パスワード検証結果:", isValid ? "一致" : "不一致")

    if (!isValid) {
      return NextResponse.json(
        { error: "パスワードが正しくありません" },
        { status: 401 }
      )
    }

    // JWTトークンを生成
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    )
    console.log("JWTトークン生成完了")

    // レスポンスを返す
    const response = NextResponse.json(
      { 
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 200 }
    )

    // トークンをCookieに設定
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1日
    })

    // ユーザー情報をCookieに設定
    response.cookies.set("currentUser", JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1日
    })

    console.log("Cookie設定完了")

    return response
  } catch (error) {
    console.error("ログイン処理エラー:", error)
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    )
  }
} 