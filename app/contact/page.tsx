"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, subject: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      toast({
        title: "Message sent",
        description: "Thank you for contacting us. We'll get back to you soon.",
      })
    }, 1500)
  }

  // FAQ data
  const faqs = [
    {
      question: "How do you ensure the authenticity of your signed jerseys?",
      answer:
        "We have a rigorous authentication process that includes expert verification, comparison with known authentic signatures, and documentation of the signing whenever possible. Each item comes with a Certificate of Authenticity and a unique hologram that can be verified in our database.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only deliver within Dubai. We offer free delivery on orders over AED 1,000.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), and cash on delivery within Dubai. All payments are processed securely through our encrypted payment system.",
    },
    {
      question: "Can I return an item if I'm not satisfied?",
      answer:
        "We offer a 14-day return policy for items in their original condition. Custom framed items cannot be returned unless there is a defect. Please contact our customer service team to initiate a return.",
    },
    {
      question: "How are the jerseys packaged for shipping?",
      answer:
        "All jerseys are carefully packaged to ensure they arrive in perfect condition. Unframed jerseys are folded with acid-free tissue paper and placed in a protective sleeve before being packaged in a sturdy box. Framed jerseys are wrapped in bubble wrap and shipped in custom boxes with corner protectors.",
    },
    {
      question: "How do I care for my signed jersey?",
      answer:
        "We recommend keeping your signed jersey out of direct sunlight and in a temperature-controlled environment. If framed, use UV-protective glass. If unframed, store flat in the protective sleeve provided. Never wash a signed jersey, as this will damage the signature.",
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8 bg-gold-gradient bg-clip-text text-transparent">
        FAQ & Contact Us
      </h1>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-black border border-gold-700 mb-8">
          <TabsTrigger
            value="faq"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Frequently Asked Questions
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="text-gold-500 data-[state=active]:bg-gold-gradient data-[state=active]:text-black font-display"
          >
            Contact Us
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <div className="max-w-3xl mx-auto mb-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gold-700">
                  <AccordionTrigger className="text-left font-display font-semibold text-gold-300 hover:text-gold-500">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 font-body">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-display font-bold mb-6 text-gold-500">Get In Touch</h2>

              {submitted ? (
                <Card className="border-gold-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/20 mb-4">
                        <Send className="h-8 w-8 text-gold-500" />
                      </div>
                      <h3 className="text-xl font-display font-bold mb-2 text-gold-500">Message Sent!</h3>
                      <p className="text-gray-300 mb-4 font-body">
                        Thank you for contacting us. We'll get back to you as soon as possible.
                      </p>
                      <Button
                        onClick={() => setSubmitted(false)}
                        className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1 font-body">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border-gold-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1 font-body">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border-gold-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1 font-body">
                      Subject
                    </label>
                    <Select value={formData.subject} onValueChange={handleSelectChange}>
                      <SelectTrigger className="border-gold-700">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order">Order Status</SelectItem>
                        <SelectItem value="product">Product Question</SelectItem>
                        <SelectItem value="authentication">Authentication Query</SelectItem>
                        <SelectItem value="returns">Returns & Refunds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1 font-body">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full min-h-[150px] border-gold-700"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-6 text-gold-500">Contact Information</h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-gold-500/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Our Location</h3>
                    <p className="text-gray-300 font-body">123 Sheikh Zayed Road, Dubai, UAE</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gold-500/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Email Us</h3>
                    <p className="text-gray-300 font-body">info@legendarysignatures.com</p>
                    <p className="text-gray-300 font-body">support@legendarysignatures.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gold-500/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Call Us</h3>
                    <p className="text-gray-300 font-body">+971 4 123 4567</p>
                    <p className="text-gray-300 font-body">Sun-Thu: 9am-6pm GST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-gold-500/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">Business Hours</h3>
                    <p className="text-gray-300 font-body">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-300 font-body">Friday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-300 font-body">Saturday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="relative h-[300px] w-full rounded-lg overflow-hidden border border-gold-700">
                <Image src="/placeholder.svg?height=300&width=600" alt="Map" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button className="bg-gold-gradient hover:bg-gold-shine bg-[length:200%_auto] hover:animate-gold-shimmer text-black font-body">
                    View on Google Maps
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
