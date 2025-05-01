"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        router.push("/admin")
      } else {
        setError("Invalid email or password")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password")
      } else {
        setError(`An error occurred during login: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-jetblack py-12">
      <Card className="w-[400px] border-gold/30 bg-charcoal">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-display text-center bg-gold-gradient bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center font-body text-offwhite/70">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-offwhite">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@legendary-signatures.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-body text-offwhite">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack font-body"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-offwhite/50 font-body">Admin account:</p>
            <p className="text-offwhite/70 font-body">Email: admin@legendary-signatures.com</p>
            <p className="text-offwhite/70 font-body">Password: admin123</p>
          </div>
        </CardContent>
        <CardFooter className="text-center">
          <Link href="/" className="text-gold hover:underline text-sm w-full font-body">
            Return to main website
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
