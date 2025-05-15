"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

// Form schema
const preOrderSchema = z.object({
  jerseyType: z.enum(["home", "away", "third", "custom"]),
  team: z.string().min(1, "Team is required"),
  player: z.string().min(1, "Player name is required"),
  size: z.enum(["S", "M", "L", "XL", "XXL"]),
  number: z.string().optional(),
  personalization: z.string().max(50, "Personalization must be less than 50 characters").optional(),
  authentication: z.boolean().default(true),
  framing: z.boolean().default(false),
  giftWrapping: z.boolean().default(false),
  specialInstructions: z.string().max(200, "Special instructions must be less than 200 characters").optional(),
})

type PreOrderFormValues = z.infer<typeof preOrderSchema>

// Popular teams for dropdown
const popularTeams = [
  "Arsenal",
  "Barcelona",
  "Bayern Munich",
  "Chelsea",
  "Juventus",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Paris Saint-Germain",
  "Real Madrid",
  "Other",
]

// Popular players for dropdown
const popularPlayers = [
  "Lionel Messi",
  "Cristiano Ronaldo",
  "Kylian Mbappé",
  "Erling Haaland",
  "Mohamed Salah",
  "Kevin De Bruyne",
  "Neymar Jr",
  "Robert Lewandowski",
  "Virgil van Dijk",
  "Harry Kane",
  "Other",
]

export function PreOrderForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customTeam, setCustomTeam] = useState("")
  const [customPlayer, setCustomPlayer] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [totalPrice, setTotalPrice] = useState(299.99) // Base price

  // Initialize form
  const form = useForm<PreOrderFormValues>({
    resolver: zodResolver(preOrderSchema),
    defaultValues: {
      jerseyType: "home",
      team: "",
      player: "",
      size: "L",
      number: "",
      personalization: "",
      authentication: true,
      framing: false,
      giftWrapping: false,
      specialInstructions: "",
    },
  })

  // Watch form values to calculate price
  const watchFraming = form.watch("framing")
  const watchAuthentication = form.watch("authentication")
  const watchGiftWrapping = form.watch("giftWrapping")

  // Calculate price based on options
  const calculatePrice = () => {
    let price = 299.99 // Base price for jersey

    if (watchFraming) price += 99.99
    if (watchAuthentication) price += 49.99
    if (watchGiftWrapping) price += 19.99

    return price
  }

  // Update price when options change
  useState(() => {
    setTotalPrice(calculatePrice())
  })

  // Handle team selection
  const handleTeamChange = (value: string) => {
    setSelectedTeam(value)
    form.setValue("team", value)
  }

  // Handle player selection
  const handlePlayerChange = (value: string) => {
    setSelectedPlayer(value)
    form.setValue("player", value)
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
      // Prepare the final data with custom team/player if "Other" was selected
      const finalTeam = data.team === "Other" ? customTeam : data.team
      const finalPlayer = data.player === "Other" ? customPlayer : data.player

      // Calculate final price
      const finalPrice = calculatePrice()

      // Create a product-like object for the cart
      const preOrderItem = {
        productId: `preorder-${Date.now()}`,
        name: `${finalTeam} ${data.jerseyType} jersey signed by ${finalPlayer}`,
        price: finalPrice,
        image: "/placeholder-3pie9.png",
        type: "preorder",
        details: {
          ...data,
          team: finalTeam,
          player: finalPlayer,
          price: finalPrice,
        },
      }

      // Add to cart
      addItem(preOrderItem)

      // Show success message
      toast({
        title: "Pre-order added to cart",
        description: "Your custom pre-order has been added to your cart.",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jersey Type */}
          <FormField
            control={form.control}
            name="jerseyType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-gold">Jersey Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="jersey-home" className="border-gold/50 text-gold" />
                      <FormLabel htmlFor="jersey-home" className="text-offwhite font-normal cursor-pointer">
                        Home Kit
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="away" id="jersey-away" className="border-gold/50 text-gold" />
                      <FormLabel htmlFor="jersey-away" className="text-offwhite font-normal cursor-pointer">
                        Away Kit
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="third" id="jersey-third" className="border-gold/50 text-gold" />
                      <FormLabel htmlFor="jersey-third" className="text-offwhite font-normal cursor-pointer">
                        Third Kit
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="jersey-custom" className="border-gold/50 text-gold" />
                      <FormLabel htmlFor="jersey-custom" className="text-offwhite font-normal cursor-pointer">
                        Custom Design
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Size */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold">Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gold/30 bg-jetblack text-offwhite">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-charcoal border-gold/30">
                    <SelectItem value="S">Small</SelectItem>
                    <SelectItem value="M">Medium</SelectItem>
                    <SelectItem value="L">Large</SelectItem>
                    <SelectItem value="XL">X-Large</SelectItem>
                    <SelectItem value="XXL">XX-Large</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Team */}
          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold">Team</FormLabel>
                <Select onValueChange={handleTeamChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gold/30 bg-jetblack text-offwhite">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-charcoal border-gold/30">
                    {popularTeams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTeam === "Other" && (
                  <Input
                    placeholder="Enter team name"
                    className="mt-2 border-gold/30 bg-jetblack text-offwhite"
                    value={customTeam}
                    onChange={(e) => setCustomTeam(e.target.value)}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Player */}
          <FormField
            control={form.control}
            name="player"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold">Player</FormLabel>
                <Select onValueChange={handlePlayerChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gold/30 bg-jetblack text-offwhite">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-charcoal border-gold/30">
                    {popularPlayers.map((player) => (
                      <SelectItem key={player} value={player}>
                        {player}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPlayer === "Other" && (
                  <Input
                    placeholder="Enter player name"
                    className="mt-2 border-gold/30 bg-jetblack text-offwhite"
                    value={customPlayer}
                    onChange={(e) => setCustomPlayer(e.target.value)}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Number */}
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold">Jersey Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 10" className="border-gold/30 bg-jetblack text-offwhite" {...field} />
                </FormControl>
                <FormDescription className="text-offwhite/50">Leave blank if you don't want a number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personalization */}
          <FormField
            control={form.control}
            name="personalization"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold">Personalization (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. To John, Best Wishes"
                    className="border-gold/30 bg-jetblack text-offwhite"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-offwhite/50">
                  Special message to be included with the signature
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Options */}
        <div className="space-y-4 pt-4 border-t border-gold/20">
          <h3 className="text-xl font-display font-bold text-gold">Additional Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Authentication */}
            <FormField
              control={form.control}
              name="authentication"
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
                    <FormLabel className="text-offwhite">Authentication Certificate (+$49.99)</FormLabel>
                    <FormDescription className="text-offwhite/50">
                      Includes official authentication certificate
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Framing */}
            <FormField
              control={form.control}
              name="framing"
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
                    <FormLabel className="text-offwhite">Premium Framing (+$99.99)</FormLabel>
                    <FormDescription className="text-offwhite/50">Display-ready in a premium frame</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Gift Wrapping */}
            <FormField
              control={form.control}
              name="giftWrapping"
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
                    <FormLabel className="text-offwhite">Gift Wrapping (+$19.99)</FormLabel>
                    <FormDescription className="text-offwhite/50">Luxury gift wrapping with card</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Special Instructions */}
          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gold">Special Instructions (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requests or instructions for your order"
                    className="border-gold/30 bg-jetblack text-offwhite min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price and Submit */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gold/20">
          <div className="mb-4 md:mb-0">
            <p className="text-offwhite/70">Estimated Price:</p>
            <p className="text-2xl font-display font-bold text-gold-warm">${totalPrice.toFixed(2)}</p>
            <p className="text-xs text-offwhite/50">Pre-orders typically take 4-6 weeks for delivery</p>
          </div>
          <Button
            type="submit"
            className="bg-gold-soft hover:bg-gold-deep text-jetblack w-full md:w-auto"
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
  )
}
