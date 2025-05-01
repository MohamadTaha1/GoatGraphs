import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, CreditCard, Lock, Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-jetblack text-offwhite border-t border-gold/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-display font-bold text-gold mb-4">LEGENDARY SIGNATURES</h3>
            <p className="text-offwhite/80 mb-4 font-body">
              The premier destination for authentic signed football jerseys from the greatest players of all time.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-offwhite/80 hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-offwhite/80 hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-offwhite/80 hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-offwhite/80 hover:text-gold transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Link href="/shop" className="text-offwhite/80 hover:text-gold transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/authenticity" className="text-offwhite/80 hover:text-gold transition-colors">
                  Authenticity Guarantee
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-offwhite/80 hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-offwhite/80 hover:text-gold transition-colors">
                  FAQ & Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold text-gold mb-4">Delivery Information</h3>
            <p className="text-offwhite/80 mb-2 font-body">We currently deliver exclusively within Dubai.</p>
            <p className="text-offwhite/80 mb-2 font-body">Free delivery on orders over AED 1,000.</p>
            <p className="text-offwhite/80 font-body">Standard delivery: 1-3 business days.</p>
          </div>

          <div>
            <h3 className="text-lg font-display font-semibold text-gold mb-4">Secure Shopping</h3>
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-5 w-5 text-gold" />
              <span className="text-offwhite/80 font-body">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-gold" />
              <span className="text-offwhite/80 font-body">Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gold" />
              <span className="text-offwhite/80 font-body">Multiple Payment Methods</span>
            </div>
            <div className="mt-4 flex space-x-2">
              <img src="/placeholder.svg?height=30&width=40&text=Visa" alt="Visa" className="h-8" />
              <img src="/placeholder.svg?height=30&width=40&text=MC" alt="Mastercard" className="h-8" />
              <img src="/placeholder.svg?height=30&width=40&text=PayPal" alt="PayPal" className="h-8" />
              <img src="/placeholder.svg?height=30&width=40&text=ApplePay" alt="Apple Pay" className="h-8" />
            </div>
          </div>
        </div>

        <div className="border-t border-gold/30 mt-8 pt-8 text-center text-offwhite/60 text-sm font-body">
          <p>&copy; {new Date().getFullYear()} Legendary Signatures. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
