import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories, type Category } from "@/hooks/use-categories"

export function CategoryShowcase() {
  const { categories, loading, error } = useCategories()

  // Ensure we have the specific categories we want to highlight
  const ensureCategory = (name: string, categories: Category[]): Category => {
    const found = categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase())
    if (found) return found

    // Return a default if not found
    return {
      id: name.toLowerCase(),
      name: name,
      imageUrl: `/images/categories/${name.toLowerCase()}.png`,
    }
  }

  // Make sure we have our key categories
  const getHighlightedCategories = (categories: Category[]) => {
    const balls = ensureCategory("Footballs", categories)
    const jerseys = ensureCategory("Jerseys", categories)
    const boots = ensureCategory("Boots", categories)

    // Add these first, then add any others
    const highlighted = [balls, jerseys, boots]

    // Add other categories that aren't already included
    categories.forEach((cat) => {
      if (!highlighted.some((h) => h.id === cat.id)) {
        highlighted.push(cat)
      }
    })

    return highlighted
  }

  if (loading) {
    return (
      <div className="container mb-16">
        <Skeleton className="h-8 w-64 mb-8 bg-gray-700" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg bg-gray-700" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mb-16">
        <h2 className="text-3xl font-display font-bold text-white mb-8">Shop by Category</h2>
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 text-red-200">{error}</div>
      </div>
    )
  }

  const highlightedCategories = getHighlightedCategories(categories)

  return (
    <div className="container mb-16">
      <h2 className="text-3xl font-display font-bold text-white mb-8">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {highlightedCategories.map((category) => (
          <Link
            key={category.id}
            href={`/customer/shop?category=${category.id}`}
            className="relative h-40 rounded-lg overflow-hidden group"
          >
            <Image
              src={category.imageUrl || `/images/categories/${category.name.toLowerCase()}.png`}
              alt={category.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h3 className="text-xl font-display font-medium text-white">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
