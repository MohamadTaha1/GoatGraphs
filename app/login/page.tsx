"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get return URL and action from query parameters
  const returnUrl = searchParams.get("returnUrl") || "/customer"
  const action = searchParams.get("action")

  // Action messages to display
  const actionMessages = {
    addToCart: "Please log in to add items to your cart.",
    requestVideo: "Please log in to request a personalized video.",
    checkout: "Please log in to complete your purchase.",
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        // Redirect to the return URL if provided
        router.push(returnUrl)
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jetblack py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-gold/30 bg-charcoal">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-display font-bold text-center text-gold">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center text-offwhite/70">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {action && actionMessages[action] && (
            <Alert className="mb-6 bg-gold/10 border-gold/30">
              <AlertDescription className="text-gold">{actionMessages[action]}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 bg-red-900/20 border-red-900/30">
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-offwhite">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-jetblack border-gold/30 text-offwhite"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-offwhite">
                  Password
                </Label>
                <Link href="#" className="text-sm text-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-jetblack border-gold/30 text-offwhite"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <span className="text-offwhite/70">Don't have an account? </span>
            <Link href="/register" className="text-gold hover:underline">
              Sign up
            </Link>
          </div>
          <Button
            variant="outline"
            className="w-full border-gold/30 text-gold hover:bg-gold/10"
            onClick={() => router.push("/")}
          >
            Continue as Guest
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
