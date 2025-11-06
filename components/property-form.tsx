"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Save, X } from "lucide-react"

interface PropertyFormProps {
  initialData?: any
  isEdit?: boolean
}

export function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Basic Info
    titleEn: initialData?.title_en || "",
    titleGr: initialData?.title_gr || "",
    descriptionEn: initialData?.description_en || "",
    descriptionGr: initialData?.description_gr || "",

    // Type and Status
    propertyType: initialData?.property_type || "apartment",
    listingType: initialData?.listing_type || "sale",
    status: initialData?.status || "available",

    // Location
    addressEn: initialData?.address_en || "",
    addressGr: initialData?.address_gr || "",
    cityEn: initialData?.city_en || "",
    cityGr: initialData?.city_gr || "",
    postalCode: initialData?.postal_code || "",

    // Pricing
    priceSale: initialData?.price_sale || "",
    priceRent: initialData?.price_rent || "",
    currency: initialData?.currency || "EUR",

    // Details
    bedrooms: initialData?.bedrooms || "",
    bathrooms: initialData?.bathrooms || "",
    areaSqm: initialData?.area_sqm || "",
    plotSizeSqm: initialData?.plot_size_sqm || "",
    floorNumber: initialData?.floor_number || "",
    totalFloors: initialData?.total_floors || "",
    yearBuilt: initialData?.year_built || "",
    energyRating: initialData?.energy_rating || "",

    // Media
    mainImageUrl: initialData?.main_image_url || "",
    tour3dUrl: initialData?.tour_3d_url || "",
    videoUrl: initialData?.video_url || "",

    // Management
    published: initialData?.published ?? true,
    featured: initialData?.featured ?? false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const propertyData = {
        title_en: formData.titleEn,
        title_gr: formData.titleGr,
        description_en: formData.descriptionEn,
        description_gr: formData.descriptionGr,
        property_type: formData.propertyType,
        listing_type: formData.listingType,
        status: formData.status,
        address_en: formData.addressEn,
        address_gr: formData.addressGr,
        city_en: formData.cityEn,
        city_gr: formData.cityGr,
        postal_code: formData.postalCode,
        price_sale: formData.priceSale ? Number.parseFloat(formData.priceSale) : null,
        price_rent: formData.priceRent ? Number.parseFloat(formData.priceRent) : null,
        currency: formData.currency,
        bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number.parseInt(formData.bathrooms) : null,
        area_sqm: formData.areaSqm ? Number.parseFloat(formData.areaSqm) : null,
        plot_size_sqm: formData.plotSizeSqm ? Number.parseFloat(formData.plotSizeSqm) : null,
        floor_number: formData.floorNumber ? Number.parseInt(formData.floorNumber) : null,
        total_floors: formData.totalFloors ? Number.parseInt(formData.totalFloors) : null,
        year_built: formData.yearBuilt ? Number.parseInt(formData.yearBuilt) : null,
        energy_rating: formData.energyRating || null,
        main_image_url: formData.mainImageUrl || null,
        tour_3d_url: formData.tour3dUrl || null,
        video_url: formData.videoUrl || null,
        published: formData.published,
        featured: formData.featured,
        created_by: user.id,
      }

      if (isEdit && initialData?.id) {
        const { error: updateError } = await supabase.from("properties").update(propertyData).eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("properties").insert(propertyData)

        if (insertError) throw insertError
      }

      router.push("/admin/properties")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save property")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Code Display (for edit mode) */}
      {isEdit && initialData?.property_code && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-sm text-slate-600">Property Code</Label>
                <div className="text-2xl font-bold font-mono text-slate-900">{initialData.property_code}</div>
              </div>
              <Badge className="bg-sky-100 text-sky-700 border-0">Auto-generated</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleEn">Title (English) *</Label>
              <Input
                id="titleEn"
                required
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="Luxury Villa with Sea View"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleGr">Title (Greek) *</Label>
              <Input
                id="titleGr"
                required
                value={formData.titleGr}
                onChange={(e) => setFormData({ ...formData, titleGr: e.target.value })}
                placeholder="Πολυτελής Βίλα με Θέα στη Θάλασσα"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Detailed property description..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptionGr">Description (Greek)</Label>
            <Textarea
              id="descriptionGr"
              value={formData.descriptionGr}
              onChange={(e) => setFormData({ ...formData, descriptionGr: e.target.value })}
              placeholder="Λεπτομερής περιγραφή ακινήτου..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Type and Status */}
      <Card>
        <CardHeader>
          <CardTitle>Type & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listingType">Listing Type *</Label>
              <Select
                value={formData.listingType}
                onValueChange={(value) => setFormData({ ...formData, listingType: value })}
              >
                <SelectTrigger id="listingType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="off-market">Off Market</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressEn">Address (English)</Label>
              <Input
                id="addressEn"
                value={formData.addressEn}
                onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressGr">Address (Greek)</Label>
              <Input
                id="addressGr"
                value={formData.addressGr}
                onChange={(e) => setFormData({ ...formData, addressGr: e.target.value })}
                placeholder="Κεντρική 123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cityEn">City (English)</Label>
              <Input
                id="cityEn"
                value={formData.cityEn}
                onChange={(e) => setFormData({ ...formData, cityEn: e.target.value })}
                placeholder="Athens"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cityGr">City (Greek)</Label>
              <Input
                id="cityGr"
                value={formData.cityGr}
                onChange={(e) => setFormData({ ...formData, cityGr: e.target.value })}
                placeholder="Αθήνα"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="10431"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceSale">Sale Price (€)</Label>
              <Input
                id="priceSale"
                type="number"
                value={formData.priceSale}
                onChange={(e) => setFormData({ ...formData, priceSale: e.target.value })}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRent">Rent Price (€/month)</Label>
              <Input
                id="priceRent"
                type="number"
                value={formData.priceRent}
                onChange={(e) => setFormData({ ...formData, priceRent: e.target.value })}
                placeholder="2000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaSqm">Area (m²)</Label>
              <Input
                id="areaSqm"
                type="number"
                value={formData.areaSqm}
                onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plotSizeSqm">Plot Size (m²)</Label>
              <Input
                id="plotSizeSqm"
                type="number"
                value={formData.plotSizeSqm}
                onChange={(e) => setFormData({ ...formData, plotSizeSqm: e.target.value })}
                placeholder="500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floorNumber">Floor Number</Label>
              <Input
                id="floorNumber"
                type="number"
                value={formData.floorNumber}
                onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                placeholder="3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFloors">Total Floors</Label>
              <Input
                id="totalFloors"
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value })}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                placeholder="2020"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energyRating">Energy Rating</Label>
              <Input
                id="energyRating"
                value={formData.energyRating}
                onChange={(e) => setFormData({ ...formData, energyRating: e.target.value })}
                placeholder="A+"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mainImageUrl">Main Image URL</Label>
            <Input
              id="mainImageUrl"
              value={formData.mainImageUrl}
              onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tour3dUrl">3D Tour URL</Label>
            <Input
              id="tour3dUrl"
              value={formData.tour3dUrl}
              onChange={(e) => setFormData({ ...formData, tour3dUrl: e.target.value })}
              placeholder="https://example.com/3d-tour"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-slate-600">Make this property visible on the website</p>
            </div>
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="featured">Featured</Label>
              <p className="text-sm text-slate-600">Show this property in featured sections</p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>}

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {isEdit ? "Update Property" : "Create Property"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          <X className="mr-2 h-5 w-5" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
