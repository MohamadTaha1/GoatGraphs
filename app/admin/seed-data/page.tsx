"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, ShoppingBag, Tag, ImageIcon, MessageSquare, FileText, Database } from "lucide-react"
import {
  seedUsers,
  seedProducts,
  seedCategories,
  seedAuctions,
  seedBanners,
  seedTestimonials,
  seedOrders,
  seedAllData,
} from "@/lib/seed-data"

export default function SeedDataPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, any>>({})

  const handleSeed = async (type: string) => {
    setLoading(type)
    try {
      let result

      switch (type) {
        case "users":
          result = await seedUsers()
          break
        case "products":
          result = await seedProducts()
          break
        case "categories":
          result = await seedCategories()
          break
        case "auctions":
          result = await seedAuctions()
          break
        case "banners":
          result = await seedBanners()
          break
        case "testimonials":
          result = await seedTestimonials()
          break
        case "orders":
          result = await seedOrders()
          break
        case "all":
          result = await seedAllData()
          break
        default:
          throw new Error("Invalid seed type")
      }

      setResults((prev) => ({ ...prev, [type]: result }))
    } catch (error) {
      console.error(`Error seeding ${type}:`, error)
      setResults((prev) => ({
        ...prev,
        [type]: { success: false, message: `Error: ${error.message}` },
      }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-offwhite">Seed Data</h1>
      </div>

      <Card className="border-gold/30 bg-charcoal mb-8">
        <CardHeader>
          <CardTitle className="text-offwhite">Database Seeding Tool</CardTitle>
          <CardDescription className="text-offwhite/70">
            Use this tool to populate your database with sample data for testing and development purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-900/20 border-amber-900/50 mb-4">
            <AlertDescription className="text-amber-500">
              Warning: Seeding may overwrite existing data. Use with caution in production environments.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SeedCard
              title="Users"
              description="Seed 5 sample users with different roles"
              icon={<Users className="h-5 w-5" />}
              loading={loading === "users"}
              result={results.users}
              onSeed={() => handleSeed("users")}
            />

            <SeedCard
              title="Products"
              description="Seed sample products with details"
              icon={<ShoppingBag className="h-5 w-5" />}
              loading={loading === "products"}
              result={results.products}
              onSeed={() => handleSeed("products")}
            />

            <SeedCard
              title="Categories"
              description="Seed product categories"
              icon={<Tag className="h-5 w-5" />}
              loading={loading === "categories"}
              result={results.categories}
              onSeed={() => handleSeed("categories")}
            />

            <SeedCard
              title="Auctions"
              description="Seed sample auctions"
              icon={<FileText className="h-5 w-5" />}
              loading={loading === "auctions"}
              result={results.auctions}
              onSeed={() => handleSeed("auctions")}
            />

            <SeedCard
              title="Banners"
              description="Seed website banners"
              icon={<ImageIcon className="h-5 w-5" />}
              loading={loading === "banners"}
              result={results.banners}
              onSeed={() => handleSeed("banners")}
            />

            <SeedCard
              title="Testimonials"
              description="Seed customer testimonials"
              icon={<MessageSquare className="h-5 w-5" />}
              loading={loading === "testimonials"}
              result={results.testimonials}
              onSeed={() => handleSeed("testimonials")}
            />

            <SeedCard
              title="Orders"
              description="Seed sample customer orders"
              icon={<ShoppingBag className="h-5 w-5" />}
              loading={loading === "orders"}
              result={results.orders}
              onSeed={() => handleSeed("orders")}
            />

            <SeedCard
              title="All Data"
              description="Seed all data types at once"
              icon={<Database className="h-5 w-5" />}
              loading={loading === "all"}
              result={results.all}
              onSeed={() => handleSeed("all")}
              className="md:col-span-2 lg:col-span-3"
            />
          </div>
        </CardContent>
      </Card>

      {Object.keys(results).length > 0 && (
        <Card className="border-gold/30 bg-charcoal">
          <CardHeader>
            <CardTitle className="text-offwhite">Seeding Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={Object.keys(results)[Object.keys(results).length - 1]}>
              <TabsList className="mb-4">
                {Object.keys(results).map((key) => (
                  <TabsTrigger key={key} value={key} className="capitalize">
                    {key}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(results).map(([key, value]) => (
                <TabsContent key={key} value={key}>
                  <div className="bg-jetblack/50 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-offwhite/80 text-sm whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface SeedCardProps {
  title: string
  description: string
  icon: React.ReactNode
  loading: boolean
  result?: any
  onSeed: () => void
  className?: string
}

function SeedCard({ title, description, icon, loading, result, onSeed, className = "" }: SeedCardProps) {
  return (
    <Card className={`border-gold/30 bg-jetblack/50 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-offwhite">
          <span className="mr-2 text-gold">{icon}</span> {title}
        </CardTitle>
        <CardDescription className="text-offwhite/70">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert
            className={`mb-4 ${
              result.success ? "bg-green-900/20 border-green-900/50" : "bg-red-900/20 border-red-900/50"
            }`}
          >
            <AlertDescription className={result.success ? "text-green-500" : "text-red-500"}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onSeed} disabled={loading} className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...
            </>
          ) : (
            `Seed ${title}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
