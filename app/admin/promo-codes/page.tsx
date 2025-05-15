"use client"

import type React from "react"

import { useState } from "react"
import { usePromoCodes, type PromoCode } from "@/hooks/use-promo-codes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Edit, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function PromoCodesPage() {
  const { promoCodes, loading, error, createPromoCode, updatePromoCode, deletePromoCode, generateCode } =
    usePromoCodes()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const { user } = useAuth()

  // Form state for create/edit
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
    isActive: true,
  })

  // Reset form data
  const resetFormData = () => {
    setFormData({
      code: generateCode(),
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), "yyyy-MM-dd"),
      isActive: true,
    })
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Open create dialog
  const openCreateDialog = () => {
    resetFormData()
    setIsCreateDialogOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode)
    setFormData({
      code: promoCode.code,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      minOrderValue: promoCode.minOrderValue || 0,
      maxDiscount: promoCode.maxDiscount || 0,
      usageLimit: promoCode.usageLimit || 0,
      startDate: format(promoCode.startDate, "yyyy-MM-dd"),
      endDate: format(promoCode.endDate, "yyyy-MM-dd"),
      isActive: promoCode.isActive,
    })
    setIsEditDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode)
    setIsDeleteDialogOpen(true)
  }

  // Handle create promo code
  const handleCreatePromoCode = async () => {
    try {
      await createPromoCode({
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType as "percentage" | "fixed",
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive,
        createdBy: user?.id || "admin",
      })

      toast({
        title: "Success",
        description: "Promo code created successfully",
        variant: "default",
      })

      setIsCreateDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create promo code",
        variant: "destructive",
      })
    }
  }

  // Handle update promo code
  const handleUpdatePromoCode = async () => {
    if (!selectedPromoCode) return

    try {
      await updatePromoCode(selectedPromoCode.id, {
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType as "percentage" | "fixed",
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        isActive: formData.isActive,
      })

      toast({
        title: "Success",
        description: "Promo code updated successfully",
        variant: "default",
      })

      setIsEditDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update promo code",
        variant: "destructive",
      })
    }
  }

  // Handle delete promo code
  const handleDeletePromoCode = async () => {
    if (!selectedPromoCode) return

    try {
      await deletePromoCode(selectedPromoCode.id)

      toast({
        title: "Success",
        description: "Promo code deleted successfully",
        variant: "default",
      })

      setIsDeleteDialogOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      })
    }
  }

  // Generate a new code
  const handleGenerateCode = () => {
    setFormData({
      ...formData,
      code: generateCode(),
    })
  }

  // Filter promo codes based on search term and active tab
  const filteredPromoCodes = promoCodes.filter((promoCode) => {
    const matchesSearch =
      promoCode.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoCode.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && promoCode.isActive
    if (activeTab === "inactive") return matchesSearch && !promoCode.isActive

    return matchesSearch
  })

  // Check if a promo code is expired
  const isExpired = (endDate: Date) => {
    return new Date() > endDate
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">Manage discount promo codes for your customers</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promo Code
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Promo Codes</CardTitle>
          <CardDescription>Create and manage promotional codes for discounts</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No promo codes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes.map((promoCode) => (
                    <TableRow key={promoCode.id}>
                      <TableCell className="font-mono font-medium">{promoCode.code}</TableCell>
                      <TableCell>{promoCode.description}</TableCell>
                      <TableCell>
                        {promoCode.discountType === "percentage"
                          ? `${promoCode.discountValue}%`
                          : `$${promoCode.discountValue.toFixed(2)}`}
                        {promoCode.minOrderValue ? ` (Min: $${promoCode.minOrderValue})` : ""}
                      </TableCell>
                      <TableCell>
                        {promoCode.usageCount}
                        {promoCode.usageLimit ? ` / ${promoCode.usageLimit}` : ""}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(promoCode.startDate, "MMM d, yyyy")}</div>
                          <div>to {format(promoCode.endDate, "MMM d, yyyy")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isExpired(promoCode.endDate) ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Expired
                          </Badge>
                        ) : promoCode.isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(promoCode)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600"
                            onClick={() => openDeleteDialog(promoCode)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Promo Code Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>Create a new promotional code for customer discounts</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="font-mono"
                  maxLength={6}
                />
                <Button type="button" variant="outline" onClick={handleGenerateCode}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountType" className="text-right">
                Discount Type
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => handleSelectChange("discountType", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="discountValue" className="text-right">
                Discount Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min={0}
                  max={formData.discountType === "percentage" ? 100 : undefined}
                />
                <span className="ml-2">{formData.discountType === "percentage" ? "%" : "$"}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minOrderValue" className="text-right">
                Min Order Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="minOrderValue"
                  name="minOrderValue"
                  type="number"
                  value={formData.minOrderValue}
                  onChange={handleInputChange}
                  min={0}
                />
                <span className="ml-2">$</span>
              </div>
            </div>
            {formData.discountType === "percentage" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxDiscount" className="text-right">
                  Max Discount
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    id="maxDiscount"
                    name="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min={0}
                  />
                  <span className="ml-2">$</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usageLimit" className="text-right">
                Usage Limit
              </Label>
              <Input
                id="usageLimit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleInputChange}
                className="col-span-3"
                min={0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-600">
                  Make this promo code active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePromoCode}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
            <DialogDescription>Update the promotional code details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="edit-code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="font-mono"
                  maxLength={6}
                />
                <Button type="button" variant="outline" onClick={handleGenerateCode}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-discountType" className="text-right">
                Discount Type
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) => handleSelectChange("discountType", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-discountValue" className="text-right">
                Discount Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="edit-discountValue"
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min={0}
                  max={formData.discountType === "percentage" ? 100 : undefined}
                />
                <span className="ml-2">{formData.discountType === "percentage" ? "%" : "$"}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-minOrderValue" className="text-right">
                Min Order Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="edit-minOrderValue"
                  name="minOrderValue"
                  type="number"
                  value={formData.minOrderValue}
                  onChange={handleInputChange}
                  min={0}
                />
                <span className="ml-2">$</span>
              </div>
            </div>
            {formData.discountType === "percentage" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-maxDiscount" className="text-right">
                  Max Discount
                </Label>
                <div className="col-span-3 flex items-center">
                  <Input
                    id="edit-maxDiscount"
                    name="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min={0}
                  />
                  <span className="ml-2">$</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-usageLimit" className="text-right">
                Usage Limit
              </Label>
              <Input
                id="edit-usageLimit"
                name="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={handleInputChange}
                className="col-span-3"
                min={0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="edit-startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="edit-endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  id="edit-isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="edit-isActive" className="ml-2 text-sm text-gray-600">
                  Make this promo code active
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePromoCode}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Promo Code Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promo code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPromoCode && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{selectedPromoCode.code}</p>
                <p className="text-sm text-gray-600">{selectedPromoCode.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePromoCode}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
