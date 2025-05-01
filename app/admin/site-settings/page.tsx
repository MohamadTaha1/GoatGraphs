"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function SiteSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Legendary Signatures",
    siteTagline: "Authentic Signed Memorabilia",
    contactEmail: "info@legendarysignatures.com",
    contactPhone: "+971 50 123 4567",
    address: "123 Sheikh Zayed Road, Dubai, UAE",
    enableMaintenanceMode: false,
  })

  const [socialSettings, setSocialSettings] = useState({
    facebook: "https://facebook.com/legendarysignatures",
    instagram: "https://instagram.com/legendarysignatures",
    twitter: "https://twitter.com/legendsignatures",
    youtube: "",
  })

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "Legendary Signatures | Authentic Signed Football Memorabilia",
    metaDescription:
      "Shop authentic signed football jerseys, balls, and memorabilia from the world's greatest players. Each item comes with a certificate of authenticity.",
    ogImage: "/images/og-image.jpg",
    googleAnalyticsId: "UA-123456789-1",
  })

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSocialSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSeoSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setGeneralSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Your site settings have been updated successfully.",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 bg-gold-gradient bg-clip-text text-transparent">
          Site Settings
        </h1>
        <p className="text-offwhite/70 font-body">Configure your website settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-charcoal border border-gold/30">
          <TabsTrigger value="general" className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack">
            General
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-gold-soft data-[state=active]:text-jetblack">
            SEO
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general" className="space-y-6">
            <Card className="border-gold/30 bg-charcoal">
              <CardHeader className="pb-3">
                <CardTitle className="text-gold font-display">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="text-offwhite">
                      Site Name
                    </Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteTagline" className="text-offwhite">
                      Site Tagline
                    </Label>
                    <Input
                      id="siteTagline"
                      name="siteTagline"
                      value={generalSettings.siteTagline}
                      onChange={handleGeneralChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-offwhite">
                      Contact Email
                    </Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={handleGeneralChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-offwhite">
                      Contact Phone
                    </Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={generalSettings.contactPhone}
                      onChange={handleGeneralChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-offwhite">
                      Business Address
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={generalSettings.address}
                      onChange={handleGeneralChange}
                      className="border-gold/30 bg-jetblack text-offwhite resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableMaintenanceMode"
                        checked={generalSettings.enableMaintenanceMode}
                        onCheckedChange={(checked) => handleSwitchChange("enableMaintenanceMode", checked)}
                      />
                      <Label htmlFor="enableMaintenanceMode" className="text-offwhite">
                        Enable Maintenance Mode
                      </Label>
                    </div>
                    <p className="text-xs text-offwhite/50 mt-1 ml-10">
                      When enabled, visitors will see a maintenance page instead of your website.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card className="border-gold/30 bg-charcoal">
              <CardHeader className="pb-3">
                <CardTitle className="text-gold font-display">Social Media Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="text-offwhite">
                      Facebook URL
                    </Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={socialSettings.facebook}
                      onChange={handleSocialChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="text-offwhite">
                      Instagram URL
                    </Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={socialSettings.instagram}
                      onChange={handleSocialChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="text-offwhite">
                      Twitter URL
                    </Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={socialSettings.twitter}
                      onChange={handleSocialChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="text-offwhite">
                      YouTube URL
                    </Label>
                    <Input
                      id="youtube"
                      name="youtube"
                      value={socialSettings.youtube}
                      onChange={handleSocialChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card className="border-gold/30 bg-charcoal">
              <CardHeader className="pb-3">
                <CardTitle className="text-gold font-display">SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle" className="text-offwhite">
                      Default Meta Title
                    </Label>
                    <Input
                      id="metaTitle"
                      name="metaTitle"
                      value={seoSettings.metaTitle}
                      onChange={handleSeoChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription" className="text-offwhite">
                      Default Meta Description
                    </Label>
                    <Textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={seoSettings.metaDescription}
                      onChange={handleSeoChange}
                      className="border-gold/30 bg-jetblack text-offwhite resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogImage" className="text-offwhite">
                      Default OG Image Path
                    </Label>
                    <Input
                      id="ogImage"
                      name="ogImage"
                      value={seoSettings.ogImage}
                      onChange={handleSeoChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="googleAnalyticsId" className="text-offwhite">
                      Google Analytics ID
                    </Label>
                    <Input
                      id="googleAnalyticsId"
                      name="googleAnalyticsId"
                      value={seoSettings.googleAnalyticsId}
                      onChange={handleSeoChange}
                      className="border-gold/30 bg-jetblack text-offwhite"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-gold-soft hover:bg-gold-deep text-jetblack" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
