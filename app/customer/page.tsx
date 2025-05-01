import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Testimonials } from "@/components/testimonials"
import { CountdownTimer } from "@/components/countdown-timer"
import { TopSellingBanner } from "@/components/top-selling-banner"
import { lazy } from "react"

// Use lazy loading for the DynamicFeaturedJerseys component
const DynamicFeaturedJerseysLazy = lazy(() =>
  import("@/components/dynamic-featured-jerseys").then((mod) => ({
    default: mod.DynamicFeaturedJerseys,
  })),
)

export default function CustomerHomePage() {
  // Set the target date for the countdown timer (1 month from now)
  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + 1)

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gold-gradient bg-clip-text text-transparent">
              Authentic Signed Jerseys from Football Legends
            </h1>
            <p className="text-xl text-offwhite/80 mb-6 font-body">
              Own a piece of football history with our premium collection of authenticated signed jerseys from the
              greatest players of all time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack font-body">
                <Link href="/customer/shop">Shop Collection</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 font-body">
                <Link href="/customer/authenticity">Our Authenticity Guarantee</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="/images/hero-jersey-collection.png"
              alt="Premium Signed Jerseys"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-display font-bold text-gold">Featured Jerseys</h2>
          <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 font-body">
            <Link href="/customer/shop">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/product/1">
            <Card className="overflow-hidden h-full border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
              <div className="relative h-[200px] w-full">
                <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  src="/images/messi-signed-jersey.png"
                  alt="Messi Signed Jersey"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-display font-bold text-gold">Lionel Messi Signed Jersey</h3>
                <p className="text-offwhite/70 text-sm font-body">Signed by Lionel Messi</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-display font-bold text-lg text-gold-warm">$1,299.99</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/product/2">
            <Card className="overflow-hidden h-full border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
              <div className="relative h-[200px] w-full">
                <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  src="/images/ronaldo-signed-jersey.png"
                  alt="Ronaldo Signed Jersey"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-display font-bold text-gold">Cristiano Ronaldo Signed Jersey</h3>
                <p className="text-offwhite/70 text-sm font-body">Signed by Cristiano Ronaldo</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-display font-bold text-lg text-gold-warm">$1,199.99</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/product/3">
            <Card className="overflow-hidden h-full border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
              <div className="relative h-[200px] w-full">
                <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  src="/images/mbappe-signed-jersey.png"
                  alt="Mbappé Signed Jersey"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-display font-bold text-gold">Kylian Mbappé Signed Jersey</h3>
                <p className="text-offwhite/70 text-sm font-body">Signed by Kylian Mbappé</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-display font-bold text-lg text-gold-warm">$999.99</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/product/4">
            <Card className="overflow-hidden h-full border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
              <div className="relative h-[200px] w-full">
                <div className="absolute inset-0 bg-gold-radial opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  src="/images/neymar-signed-jersey.png"
                  alt="Neymar Signed Jersey"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-display font-bold text-gold">Neymar Jr. Signed Jersey</h3>
                <p className="text-offwhite/70 text-sm font-body">Signed by Neymar Jr.</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-display font-bold text-lg text-gold-warm">$899.99</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Limited Time Offer */}
      <section className="mb-16">
        <Card className="border-gold/30 bg-black overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative h-[300px] lg:h-auto overflow-hidden">
                <Image
                  src="/images/limited-edition-messi-jersey.png"
                  alt="Limited Edition Offer"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-gold text-black text-sm font-bold px-3 py-1 rounded-full">
                  EXCLUSIVE
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2 text-gold">Limited Time Offer</h3>
                <p className="text-offwhite/80 mb-6 font-body">
                  Exclusive signed Lionel Messi World Cup jersey. Only 10 pieces available worldwide. Don't miss your
                  chance to own this piece of football history.
                </p>
                <div className="mb-6">
                  <p className="text-sm text-offwhite/60 mb-2 font-body">Offer ends in:</p>
                  <CountdownTimer targetDate={targetDate} />
                </div>
                <Button asChild className="bg-gold-soft hover:bg-gold-deep text-jetblack font-body w-full sm:w-auto">
                  <Link href="/customer/shop">Shop Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Top Selling Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold mb-8 text-gold">Top Selling Items</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="overflow-hidden border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
            <div className="relative h-[250px]">
              <Image src="/images/top-selling-jersey-1.png" alt="Top Selling Jersey" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">BEST SELLER</span>
                  <h3 className="font-display font-bold text-white mt-2">Manchester United Home Jersey</h3>
                  <p className="text-white/80 text-sm">Signed by Cristiano Ronaldo</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
            <div className="relative h-[250px]">
              <Image src="/images/top-selling-jersey-2.png" alt="Top Selling Jersey" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">TRENDING</span>
                  <h3 className="font-display font-bold text-white mt-2">Barcelona Home Jersey</h3>
                  <p className="text-white/80 text-sm">Signed by Lionel Messi</p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden border border-gold/20 bg-charcoal hover:border-gold/40 transition-all group">
            <div className="relative h-[250px]">
              <Image src="/images/top-selling-jersey-3.png" alt="Top Selling Jersey" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-gold text-black text-xs font-bold px-2 py-1 rounded-full">POPULAR</span>
                  <h3 className="font-display font-bold text-white mt-2">PSG Home Jersey</h3>
                  <p className="text-white/80 text-sm">Signed by Kylian Mbappé</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <TopSellingBanner />
      </section>

      {/* Authenticity Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-display font-bold mb-4 text-gold">Our Authenticity Guarantee</h2>
            <p className="text-offwhite/80 mb-4 font-body">
              Every signed jersey in our collection comes with a Certificate of Authenticity. Our team of experts
              verifies each signature to ensure its legitimacy.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 font-body text-offwhite/80">
                <span className="text-gold">✓</span> Expert verification process
              </li>
              <li className="flex items-center gap-2 font-body text-offwhite/80">
                <span className="text-gold">✓</span> Holographic certification
              </li>
              <li className="flex items-center gap-2 font-body text-offwhite/80">
                <span className="text-gold">✓</span> Photo documentation
              </li>
              <li className="flex items-center gap-2 font-body text-offwhite/80">
                <span className="text-gold">✓</span> Money-back guarantee
              </li>
            </ul>
            <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold/10 font-body">
              <Link href="/customer/authenticity">Learn More</Link>
            </Button>
          </div>
          <div className="relative h-[300px] order-1 lg:order-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src="/images/certificate-of-authenticity.png"
                  alt="Authenticity Guarantee"
                  fill
                  className="object-contain rounded-lg shadow-lg shadow-gold/20"
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 lg:h-32 lg:w-32">
              <Image src="/images/authenticity-seal.png" alt="Authenticity Seal" fill className="object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-display font-bold mb-8 text-center text-gold">What Our Customers Say</h2>
        <Testimonials />
      </section>

      {/* CTA Section */}
      <section>
        <div className="bg-gold-gradient rounded-lg p-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4 text-jetblack">Join the Legendary Family</h2>
          <p className="text-jetblack/80 mb-6 max-w-2xl mx-auto font-body">
            Browse our collection of authentic signed jerseys and own a piece of football history today.
          </p>
          <Button asChild className="bg-jetblack text-gold hover:bg-jetblack/80 font-body">
            <Link href="/customer/shop">Shop Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
