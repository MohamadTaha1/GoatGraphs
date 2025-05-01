import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const faqs = [
    {
      question: "How do you ensure the authenticity of your signed jerseys?",
      answer:
        "We have a rigorous authentication process that includes expert verification, comparison with known authentic signatures, and documentation of the signing whenever possible. Each item comes with a Certificate of Authenticity and a unique hologram that can be verified in our database.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship worldwide. International shipping costs and delivery times vary depending on the destination. All international orders are fully insured and require signature upon delivery.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and bank transfers for larger purchases. All payments are processed securely through our encrypted payment system.",
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
      question: "Do you offer framing services?",
      answer:
        "Yes, we offer custom framing for all our signed jerseys. We use museum-quality, UV-protective glass and acid-free materials to ensure your memorabilia is preserved for generations. You can select framing options during checkout.",
    },
    {
      question: "How long will it take to receive my order?",
      answer:
        "Domestic orders typically ship within 1-2 business days and arrive within 3-5 business days. International shipping times vary by location. You will receive a tracking number once your order ships.",
    },
    {
      question: "Do you offer gift wrapping?",
      answer:
        "Yes, we offer premium gift wrapping services for an additional fee. You can select this option during checkout and include a personalized message for the recipient.",
    },
    {
      question: "What if I have questions about a specific item?",
      answer:
        "Our team of experts is available to answer any questions you may have about specific items. You can contact us via email, phone, or the live chat feature on our website.",
    },
    {
      question: "Do you offer payment plans for higher-priced items?",
      answer:
        "Yes, we offer flexible payment plans for purchases over $1,000. You can select this option during checkout or contact our customer service team for more information.",
    },
    {
      question: "How do I care for my signed jersey?",
      answer:
        "We recommend keeping your signed jersey out of direct sunlight and in a temperature-controlled environment. If framed, use UV-protective glass. If unframed, store flat in the protective sleeve provided. Never wash a signed jersey, as this will damage the signature.",
    },
    {
      question: "Do you buy or consign signed jerseys?",
      answer:
        "Yes, we do buy authenticated signed jerseys and offer consignment services. Please contact our acquisitions team with details and photos of your item for evaluation.",
    },
  ]

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gold-500">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">
          Find answers to the most common questions about our products and services.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-gold-300 hover:text-gold-500">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="bg-black text-white rounded-lg p-8 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gold-500 mb-4">Still Have Questions?</h2>
        <p className="text-gray-300 mb-6">
          Our team is here to help. Contact us for personalized assistance with any questions you may have.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gold-500 text-black hover:bg-gold-600">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500/10">
            <Link href="/shop">Browse Collection</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
