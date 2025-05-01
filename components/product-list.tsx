"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setProducts([
        { id: 1, name: "Product 1", price: "$19.99", description: "A great product" },
        { id: 2, name: "Product 2", price: "$29.99", description: "Another great product" },
        { id: 3, name: "Product 3", price: "$39.99", description: "The best product" },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.price}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{product.description}</p>
          </CardContent>
          <CardFooter>
            <Button>Add to Cart</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
