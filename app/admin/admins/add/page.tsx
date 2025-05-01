"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAdminUsers } from "@/hooks/use-admin-users"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  displayName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phoneNumber: z.string().optional(),
  role: z.enum(["admin", "superadmin"]),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type FormValues = z.infer<typeof formSchema>

export default function AddAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addAdminUser } = useAdminUsers()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      phoneNumber: "",
      role: "admin",
      password: "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // In a real implementation, you would create the user in Firebase Auth
      // and then store the user data in Firestore
      // For this demo, we'll just add the user to Firestore

      const userId = await addAdminUser({
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        newsletter: false,
        status: "active",
        lastLogin: new Date().toISOString(),
      })

      if (userId) {
        toast({
          title: "Admin created",
          description: "The admin user has been created successfully.",
        })
        router.push("/admin/admins")
      } else {
        toast({
          title: "Error",
          description: "Failed to create admin user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating admin:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gold">Add Admin User</h1>
        <p className="text-gold/70">Create a new administrator account</p>
      </div>

      <div className="rounded-lg border border-gold/30 bg-charcoal p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@example.com"
                        {...field}
                        className="bg-jetblack border-gold/30 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} className="bg-jetblack border-gold/30 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+971 50 123 4567"
                        {...field}
                        className="bg-jetblack border-gold/30 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-jetblack border-gold/30 text-white">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-charcoal border-gold/30 text-white">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gold/70">
                      Super Admins have access to all features including user management.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-jetblack border-gold/30 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gold/70">Password must be at least 8 characters.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/admins")}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Admin"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
