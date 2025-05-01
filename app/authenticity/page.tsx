import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Shield, Search, Award, FileCheck } from "lucide-react"

export default function AuthenticityPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gold-500">Our Authenticity Guarantee</h1>
        <p className="text-xl text-gray-600">
          At Legendary Signatures, we take authenticity seriously. Every signed jersey in our collection undergoes a
          rigorous verification process to ensure its legitimacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gold-500">The Gold Standard in Authentication</h2>
          <p className="text-gray-600 mb-6">
            Our team of experts has decades of combined experience in sports memorabilia authentication. We use advanced
            techniques and technologies to verify the authenticity of every signature.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-gold-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Expert Verification</h3>
                <p className="text-gray-600">Each signature is examined by multiple authentication experts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-gold-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Holographic Certification</h3>
                <p className="text-gray-600">
                  Every item includes a unique hologram that can be verified in our database.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-gold-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Photo Documentation</h3>
                <p className="text-gray-600">
                  We document the signing process whenever possible to provide additional proof.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-gold-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Money-Back Guarantee</h3>
                <p className="text-gray-600">If any item is proven to be inauthentic, we offer a full refund.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-[400px]">
          <Image
            src="/placeholder.svg?height=400&width=500"
            alt="Authentication Process"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="bg-black text-white rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gold-500 mb-4">Certificate of Authenticity</h2>
            <p className="text-gray-300 mb-6">
              Every signed jersey comes with a detailed Certificate of Authenticity that includes:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-500" />
                <span>Unique certification number</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-500" />
                <span>Player information and career highlights</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-500" />
                <span>Date and location of signing</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-500" />
                <span>High-resolution photos of the signature</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold-500" />
                <span>Holographic seal that matches the jersey</span>
              </li>
            </ul>
          </div>
          <div className="relative h-[300px]">
            <Image
              src="/placeholder.svg?height=300&width=400"
              alt="Certificate of Authenticity"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gold-500">Our Authentication Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gold-500/10 p-4 rounded-full">
                  <Search className="h-8 w-8 text-gold-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Acquisition</h3>
              <p className="text-gray-600 text-center">
                We work directly with players, teams, and trusted partners to acquire authentic signed jerseys.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gold-500/10 p-4 rounded-full">
                  <Search className="h-8 w-8 text-gold-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Verification</h3>
              <p className="text-gray-600 text-center">
                Our team of experts examines each signature using advanced techniques and comparison databases.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gold-500/10 p-4 rounded-full">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Documentation</h3>
              <p className="text-gray-600 text-center">
                We create detailed documentation and apply a unique holographic seal to each item.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gold-500/10 p-4 rounded-full">
                  <Award className="h-8 w-8 text-gold-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Certification</h3>
              <p className="text-gray-600 text-center">
                Each jersey receives a Certificate of Authenticity with a matching hologram number.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 text-gold-500">Verify Your Certificate</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Already own a Legendary Signatures jersey? Verify its authenticity by entering the certificate number below.
        </p>
        <div className="flex max-w-md mx-auto">
          <input
            type="text"
            placeholder="Enter certificate number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button className="bg-gold-500 text-black hover:bg-gold-600 rounded-l-none">Verify</Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gold-500">Have Questions?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          If you have any questions about our authentication process or want to learn more about a specific item, our
          team is here to help.
        </p>
        <Button asChild className="bg-black text-gold-500 hover:bg-black-300 border border-gold-500">
          <Link href="/contact">Contact Our Experts</Link>
        </Button>
      </div>
    </div>
  )
}
