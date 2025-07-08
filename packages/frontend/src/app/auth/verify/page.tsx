"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmail() {
  const [message, setMessage] = useState("Verifying your email...")
  const searchParams = useSearchParams()
  const router = useRouter()
  const status = searchParams.get("status")
  const initialMessage = searchParams.get("message")
  const [count, setCount] = useState(5)

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage)
      return
    }

    if (status === "success") {
      setMessage("Email verified successfully! Redirecting to login page...")
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 500)
      return () => clearTimeout(timer)
    }

    if (count === 0) {
      router.push('/dashboard')
      return
    }
    const timer = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(timer)
  }, [initialMessage, status, count, router]);

  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p>{message}</p>
        {status === "success" && (
        <div className="flex flex-col gap-4">
          <p className="mt-2 text-sm text-muted-foreground">
            You will be redirected to login page in {count} seconds...
          </p>
          <Button asChild>
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
        </div>
        )}
      </div>
    </div>
  )
}
