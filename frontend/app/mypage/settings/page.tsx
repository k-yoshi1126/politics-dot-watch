import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <SettingsForm />
    </main>
  )
}
