"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getUser } from "@/hooks/use-users"
import { useAdminUsers } from "@/hooks/use-admin-users"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  displayName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phoneNumber: z.string().optional(),
  role: z.enum(["admin", "superadmin"]),
  status: z.enum(["active", "inactive"]),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { updateAdminUser } = useAdminUsers()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      displayName: "",
      phoneNumber: "",
      role: "admin",
      status: "active",
      password: undefined,
    },
  })

  useEffect(() => {
    async function loadAdminUser() {
      try {
        const user = await getUser(params.id)
        if (user) {
          setAdminUser(user)
          form.reset({
            email: user.email,
            displayName: user.displayName || "",
            phoneNumber: user.phoneNumber || "",
            role: user.role as "admin" | "superadmin",
            status: user.status || "active",
          })
        } else {
          toast({
            title: "Error",
            description: "Admin user not found",
            variant: "destructive",
          })
          router.push("/admin/admins")
        }
      } catch (error) {
        console.error("Error loading admin user:", error)
        toast({
          title: "Error",
          description: "Failed to load admin user. Please try again.",
          variant: "destructive",
        })
        router.push("/admin/admins")
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminUser()
  }, [params.id, router, toast, form])

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Prepare update data (exclude password if not changed)
      const updateData: any = {
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        role: data.role,
        status: data.status,
      }

      // Only include password if it was provided (for changing password)
      if (data.password) {
        // In a real implementation, you would update the user's password in Firebase Auth
        console.log("Password would be updated to:", data.password)
      }

      const success = await updateAdminUser(params.id, updateData)

      if (success) {
        toast({
          title: "Admin updated",
          description: "The admin user has been updated successfully.",
        })
        router.push("/admin/admins")
      } else {
        toast({
          title: "Error",
          description: "Failed to update admin user. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating admin:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-gold">Loading admin user...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gold">Edit Admin User</h1>
        <p className="text-gold/70">Update administrator account details</p>
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
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gold/30 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gold">Active Status</FormLabel>
                      <FormDescription className="text-gold/70">
                        Inactive admins cannot log in to the admin panel.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === "active"}
                        onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">New Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        {...field}
                        className="bg-jetblack border-gold/30 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gold/70">
                      Only fill this if you want to change the password.
                    </FormDescription>
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
