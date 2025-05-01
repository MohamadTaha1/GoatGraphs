"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const success = await register(email, password, displayName)

      if (success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/customer")
        }, 2000)
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      if (err.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please use a different email or try logging in.")
      } else {
        setError(`Registration error: ${err.message}`)
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
            Create an Account
          </CardTitle>
          <CardDescription className="text-center font-body text-offwhite/70">
            Register to track orders and save your favorite items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-900/50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-900/20 border-green-900/50">
              <AlertDescription className="text-green-500">
                Registration successful! Redirecting to your account...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body text-offwhite">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-offwhite">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-offwhite">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gold/30 bg-jetblack text-offwhite"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-body text-offwhite">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <div className="text-sm text-offwhite/70">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </div>
          <Link href="/" className="text-gold hover:underline text-sm w-full font-body">
            Return to main website
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
