"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: "cart" | "video" | "order" | "general"
  returnUrl?: string
}

export function AuthRequiredModal({ isOpen, onClose, actionType, returnUrl }: AuthRequiredModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, register } = useAuth()
  const router = useRouter()

  const actionMessages = {
    cart: "You need to sign in to add items to your cart.",
    video: "You need to sign in to request personalized videos.",
    order: "You need to sign in to place an order.",
    general: "You need to sign in to perform this action.",
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const success = await login(loginEmail, loginPassword)
      if (success) {
        onClose()
        if (returnUrl) {
          router.push(returnUrl)
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setIsSubmitting(false)
      return
    }

    try {
      const success = await register(registerEmail, registerPassword, registerName)
      if (success) {
        onClose()
        if (returnUrl) {
          router.push(returnUrl)
        }
      } else {
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during registration")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-charcoal border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-gold">Authentication Required</DialogTitle>
          <DialogDescription className="text-offwhite/70">{actionMessages[actionType]}</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "register")}
        >
          <TabsList className="grid w-full grid-cols-2 bg-jetblack">
            <TabsTrigger value="login" className="text-gold data-[state=active]:bg-gold/20">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="text-gold data-[state=active]:bg-gold/20">
              Register
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-offwhite">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="bg-jetblack border-gold/20 text-offwhite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-offwhite">
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="bg-jetblack border-gold/20 text-offwhite"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-deep text-black font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-offwhite">
                  Full Name
                </Label>
                <Input
                  id="register-name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  className="bg-jetblack border-gold/20 text-offwhite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-offwhite">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="bg-jetblack border-gold/20 text-offwhite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-offwhite">
                  Password
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="bg-jetblack border-gold/20 text-offwhite"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold-deep text-black font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gold/20 text-offwhite hover:bg-gold/10 hover:text-gold"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Add default export that references the named export
export default AuthRequiredModal
