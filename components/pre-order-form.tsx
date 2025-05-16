"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Check, Video, Award } from "lucide-react"

// Form schema
const preOrderSchema = z.object({
  personalization: z
    .string()
    .min(1, "Personalization message is required")
    .max(50, "Personalization must be less than 50 characters"),
  vipFrame: z.boolean().default(false),
  specialInstructions: z.string().max(200, "Special instructions must be less than 200 characters").optional(),
})

type PreOrderFormValues = z.infer<typeof preOrderSchema>

// Pre-defined jersey options
const jerseyOptions = [
  {
    id: "jersey-1",
    title: "Manchester United Home Kit 2023/24",
    player: "Marcus Rashford",
    image: "/placeholder-rli5n.png",
    price: 299.99,
    description: "Official Manchester United home jersey signed by Marcus Rashford.",
  },
  {
    id: "jersey-2",
    title: "Real Madrid Home Kit 2023/24",
    player: "Jude Bellingham",
    image: "/placeholder-nbo7j.png",
    price: 349.99,
    description: "Official Real Madrid home jersey signed by Jude Bellingham.",
  },
  {
    id: "jersey-3",
    title: "Barcelona Home Kit 2023/24",
    player: "Robert Lewandowski",
    image: "/placeholder-bz0yz.png",
    price: 329.99,
    description: "Official Barcelona home jersey signed by Robert Lewandowski.",
  },
]

export function PreOrderForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedJersey, setSelectedJersey] = useState(jerseyOptions[0])

  // Initialize form
  const form = useForm<PreOrderFormValues>({
    resolver: zodResolver(preOrderSchema),
    defaultValues: {
      personalization: "",
      vipFrame: false,
      specialInstructions: "",
    },
  })

  // Calculate price based on options
  const calculatePrice = () => {
    let price = selectedJersey.price
    if (form.watch("vipFrame")) price += 150.0
    return price
  }

  // Handle form submission
  const onSubmit = async (data: PreOrderFormValues) => {
    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = encodeURIComponent(window.location.pathname)
      router.push(`/login?returnUrl=${returnUrl}&action=preOrder`)
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate final price
      const finalPrice = calculatePrice()

      // Create a product-like object for the cart
      const preOrderItem = {
        productId: `preorder-${selectedJersey.id}-${Date.now()}`,
        name: `${selectedJersey.title} - Personalized`,
        price: finalPrice,
        image: selectedJersey.image,
        type: "preorder",
        details: {
          jersey: selectedJersey.title,
          player: selectedJersey.player,
          personalization: data.personalization,
          vipFrame: data.vipFrame,
          specialInstructions: data.specialInstructions,
          price: finalPrice,
        },
      }

      // Add to cart
      addItem(preOrderItem)

      // Show success message
      toast({
        title: "Pre-order added to cart",
        description: "Your personalized jersey has been added to your cart.",
      })

      // Reset form
      form.reset()

      // Optionally redirect to cart
      // router.push("/customer/cart")
    } catch (error) {
      console.error("Error adding pre-order to cart:", error)
      toast({
        title: "Error",
        description: "There was an error adding your pre-order to the cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Pre-order Benefits Banner */}
      <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Video className="h-5 w-5 text-gold" />
          <h3 className="text-lg font-display font-bold text-gold">Exclusive Video Documentation</h3>
        </div>
        <p className="text-offwhite/80 ml-8">
          All pre-orders include a personalized video of the player signing your item, providing undeniable proof of
          authenticity and a unique keepsake.
        </p>
      </div>

      {/* Jersey Selection */}
      <div>
        <h3 className="text-xl font-display font-bold text-gold mb-4">Select a Jersey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jerseyOptions.map((jersey) => (
            <Card
              key={jersey.id}
              className={`cursor-pointer transition-all overflow-hidden ${
                selectedJersey.id === jersey.id
                  ? "border-gold bg-gold/10"
                  : "border-gold/30 bg-charcoal hover:border-gold/50"
              }`}
              onClick={() => setSelectedJersey(jersey)}
            >
              <div className="relative h-48">
                <Image src={jersey.image || "/placeholder.svg"} alt={jersey.title} fill className="object-contain" />
                {selectedJersey.id === jersey.id && (
                  <div className="absolute top-2 right-2 bg-gold rounded-full p-1">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-display font-bold text-offwhite">{jersey.title}</h4>
                <p className="text-sm text-offwhite/70">Signed by {jersey.player}</p>
                <p className="text-gold-warm font-display font-bold mt-2">${jersey.price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Personalization Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-charcoal/50 border border-gold/30 rounded-lg p-6">
            <h3 className="text-xl font-display font-bold text-gold mb-4">Personalization Details</h3>
            <p className="text-offwhite/70 mb-6">
              Add your personal message to be included with the signature on your selected jersey.
            </p>

            {/* Personalization Message */}
            <FormField
              control={form.control}
              name="personalization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gold">Personalization Message*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. To John, Best Wishes"
                      className="border-gold/30 bg-jetblack text-offwhite min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-offwhite/50">
                    This message will be written alongside the player's signature (50 characters max)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* VIP Frame Option */}
            <div className="mt-6">
              <FormField
                control={form.control}
                name="vipFrame"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gold/30 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-jetblack"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-offwhite">VIP Frame (+$150.00)</FormLabel>
                        <Award className="h-4 w-4 text-gold" />
                      </div>
                      <FormDescription className="text-offwhite/50">
                        Premium museum-quality frame with UV protection and certificate display
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Special Instructions */}
            <div className="mt-6">
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold">Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requests or instructions for your order"
                        className="border-gold/30 bg-jetblack text-offwhite min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-charcoal/50 border border-gold/30 rounded-lg p-6">
            <h3 className="text-xl font-display font-bold text-gold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-offwhite/70">Jersey:</span>
                <span className="text-offwhite">{selectedJersey.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offwhite/70">Player Signature:</span>
                <span className="text-offwhite">{selectedJersey.player}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-offwhite/70">Base Price:</span>
                <span className="text-offwhite">${selectedJersey.price.toFixed(2)}</span>
              </div>
              {form.watch("vipFrame") && (
                <div className="flex justify-between">
                  <span className="text-offwhite/70">VIP Frame:</span>
                  <span className="text-offwhite">$150.00</span>
                </div>
              )}
              <div className="border-t border-gold/20 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gold">Total:</span>
                <span className="text-gold">${calculatePrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm text-offwhite/50 mb-6">
              <p>• Pre-orders typically take 3-4 weeks for delivery</p>
              <p>• Each jersey comes with a certificate of authenticity</p>
              <p>• Includes video of the player signing your item</p>
              <p>• Free shipping on all pre-orders</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gold-soft hover:bg-gold-deep text-jetblack"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Pre-Order to Cart"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
