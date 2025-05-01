"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData)
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      })
      setFormData({ name: "", email: "", message: "" })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input name="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Input
          name="email"
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Textarea name="message" placeholder="Your message" value={formData.message} onChange={handleChange} required />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
