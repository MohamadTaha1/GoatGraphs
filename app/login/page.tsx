"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, continueAsGuest } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (!success) {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestAccess = () => {
    continueAsGuest()
    router.push("/customer")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-jetblack p-4">
      <Card className="w-full max-w-md bg-charcoal border-gold/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-display text-gold text-center">Login</CardTitle>
          <CardDescription className="text-center text-offwhite/70">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                className="bg-jetblack border-gold/20 text-offwhite"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-offwhite">
                  Password
                </Label>
                <Link href="#" className="text-xs text-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-jetblack border-gold/20 text-offwhite"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-deep text-black font-medium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gold/20"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-charcoal px-2 text-offwhite/70">or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-gold/20 text-offwhite hover:bg-gold/10 hover:text-gold"
            onClick={handleGuestAccess}
          >
            Continue as Guest
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-offwhite/70">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-gold hover:underline">
              Register
            </Link>
          </div>
          <div className="text-center text-xs text-offwhite/50">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
