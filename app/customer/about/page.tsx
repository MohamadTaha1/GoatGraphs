import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gold-500">About Legendary Signatures</h1>
        <p className="text-xl text-gray-600">
          The premier destination for authentic signed football jerseys from the greatest players of all time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative h-[400px]">
          <Image src="/images/our-story.png" alt="Our Story" fill className="object-cover rounded-lg" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4 text-gold-500">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Legendary Signatures was founded in 2015 by a group of passionate football fans and memorabilia collectors
            who were frustrated by the prevalence of counterfeit signed jerseys in the market.
          </p>
          <p className="text-gray-600 mb-4">
            What began as a small operation has grown into one of the most trusted sources for authentic signed football
            jerseys worldwide. Our commitment to authenticity, quality, and customer service has earned us a reputation
            as the gold standard in sports memorabilia.
          </p>
          <p className="text-gray-600">
            Today, we work directly with players, clubs, and trusted partners to bring you the most exclusive and
            authentic signed jerseys from the biggest names in football.
          </p>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gold-500">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="relative h-[150px] mb-4">
                <Image
                  src="/images/authenticity-value.png"
                  alt="Authenticity"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Authenticity</h3>
              <p className="text-gray-600 text-center">
                We guarantee the authenticity of every item we sell. Our rigorous verification process ensures that
                you're getting a genuine piece of football history.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="relative h-[150px] mb-4">
                <Image src="/images/quality-value.png" alt="Quality" fill className="object-cover rounded-lg" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Quality</h3>
              <p className="text-gray-600 text-center">
                We only offer the highest quality jerseys and memorabilia. Each item is carefully inspected to ensure it
                meets our exacting standards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gold-500">
            <CardContent className="pt-6">
              <div className="relative h-[150px] mb-4">
                <Image src="/images/trust-value.png" alt="Trust" fill className="object-cover rounded-lg" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Trust</h3>
              <p className="text-gray-600 text-center">
                We've built our reputation on trust and transparency. From our authentication process to our customer
                service, we're committed to earning and keeping your trust.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-black text-white rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gold-500 mb-4">Our Expertise</h2>
            <p className="text-gray-300 mb-4">
              Our team includes some of the most knowledgeable experts in sports memorabilia authentication. With
              decades of combined experience, our authentication team can spot the subtlest differences between genuine
              and forged signatures.
            </p>
            <p className="text-gray-300">
              We've developed relationships with players, clubs, and agents around the world, allowing us to source
              authentic signed jerseys directly from the source. This direct access ensures the provenance of our items
              and allows us to share the stories behind the signatures.
            </p>
          </div>
          <div className="relative h-[300px]">
            <Image src="/images/expertise-team.png" alt="Our Expertise" fill className="object-cover rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gold-500">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "John Smith", title: "Founder & CEO", image: "/images/team-member-1.png" },
            { name: "Sarah Johnson", title: "Authentication Expert", image: "/images/team-member-2.png" },
            { name: "Michael Brown", title: "Head of Acquisitions", image: "/images/team-member-3.png" },
            {
              name: "Emma Wilson",
              title: "Customer Experience Director",
              image: "/images/team-member-4.png",
            },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative h-64 w-64 mx-auto mb-4 rounded-full overflow-hidden">
                <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gold-500">{member.name}</h3>
              <p className="text-gray-600">{member.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-8 text-center mb-16">
        <h2 className="text-3xl font-bold mb-4 text-gold-500">Our Partnerships</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          We're proud to partner with clubs, players, and organizations around the world to bring you authentic signed
          memorabilia.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {["/images/partner-1.png", "/images/partner-2.png", "/images/partner-3.png", "/images/partner-4.png"].map(
            (partner, i) => (
              <div key={i} className="flex items-center justify-center">
                <div className="relative h-[100px] w-[200px]">
                  <Image src={partner || "/placeholder.svg"} alt={`Partner ${i + 1}`} fill className="object-contain" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-gold-500">Join the Legendary Family</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Whether you're a seasoned collector or just starting your collection, we're here to help you find the perfect
          piece of football history.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gold-500 text-black hover:bg-gold-600">
            <Link href="/shop">Shop Our Collection</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500/10">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
        <div className="mt-8 relative h-[300px] max-w-3xl mx-auto">
          <Image src="/images/jersey-collection.png" alt="Jersey Collection" fill className="object-cover rounded-lg" />
        </div>
      </div>
    </div>
  )
}
