"use client"

import * as React from "react"
import { useTransition } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetDescription, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { createProperty, updateProperty, type PropertyInput } from "@/lib/actions/properties"
import type { Property } from "@/lib/hooks/use-properties"
import { AdminPropertyImageUploader } from "@/components/admin-property-image-uploader"
import { cn } from "@/lib/utils"

type PropertyFormValues = {
  title_en: string
  title_gr: string
  description_en: string
  description_gr: string
  property_type: string
  listing_type: string
  status: string
  region_id: string | null
  address_en: string
  address_gr: string
  city_en: string
  city_gr: string
  postal_code: string
  price_sale: string
  price_rent: string
  currency: string
  bedrooms: string
  bathrooms: string
  area_sqm: string
  plot_size_sqm: string
  floor_number: string
  total_floors: string
  year_built: string
  energy_rating: string
  main_image_url: string
  tour_3d_url: string
  video_url: string
  meta_title_en: string
  meta_title_gr: string
  meta_description_en: string
  meta_description_gr: string
  documents: string
  featured: boolean
  published: boolean
  display_order: string
}

const defaultValues: PropertyFormValues = {
  title_en: "",
  title_gr: "",
  description_en: "",
  description_gr: "",
  property_type: "apartment",
  listing_type: "sale",
  status: "available",
  region_id: null,
  address_en: "",
  address_gr: "",
  city_en: "",
  city_gr: "",
  postal_code: "",
  price_sale: "",
  price_rent: "",
  currency: "EUR",
  bedrooms: "",
  bathrooms: "",
  area_sqm: "",
  plot_size_sqm: "",
  floor_number: "",
  total_floors: "",
  year_built: "",
  energy_rating: "",
  main_image_url: "",
  tour_3d_url: "",
  video_url: "",
  meta_title_en: "",
  meta_title_gr: "",
  meta_description_en: "",
  meta_description_gr: "",
  documents: "",
  featured: false,
  published: true,
  display_order: "0",
}

interface AdminPropertyFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property?: Property | null
}

export function AdminPropertyFormSheet({ open, onOpenChange, property }: AdminPropertyFormSheetProps) {
  const mode = property ? "edit" : "create"
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = React.useState("basics")
  const [formValues, setFormValues] = React.useState<PropertyFormValues>(defaultValues)

  React.useEffect(() => {
    if (property) {
      setFormValues({
        title_en: property.title_en || "",
        title_gr: property.title_gr || "",
        description_en: (property as any).description_en || "",
        description_gr: (property as any).description_gr || "",
        property_type: property.property_type || "apartment",
        listing_type: (property as any).listing_type || "sale",
        status: property.status || "available",
        region_id: property.region_id || null,
        address_en: (property as any).address_en || "",
        address_gr: (property as any).address_gr || "",
        city_en: (property as any).city_en || "",
        city_gr: (property as any).city_gr || "",
        postal_code: (property as any).postal_code || "",
        price_sale: property.price_sale?.toString() || "",
        price_rent: (property as any).price_rent?.toString() || "",
        currency: (property as any).currency || "EUR",
        bedrooms: (property as any).bedrooms?.toString() || "",
        bathrooms: (property as any).bathrooms?.toString() || "",
        area_sqm: (property as any).area_sqm?.toString() || "",
        plot_size_sqm: (property as any).plot_size_sqm?.toString() || "",
        floor_number: (property as any).floor_number?.toString() || "",
        total_floors: (property as any).total_floors?.toString() || "",
        year_built: (property as any).year_built?.toString() || "",
        energy_rating: (property as any).energy_rating || "",
        main_image_url: property.cover_image_url || "",
        tour_3d_url: (property as any).tour_3d_url || "",
        video_url: (property as any).video_url || "",
        meta_title_en: (property as any).meta_title_en || "",
        meta_title_gr: (property as any).meta_title_gr || "",
        meta_description_en: (property as any).meta_description_en || "",
        meta_description_gr: (property as any).meta_description_gr || "",
        documents: "",
        featured: (property as any).featured ?? false,
        published: property.published ?? true,
        display_order: ((property as any).display_order ?? 0).toString(),
      })
    } else {
      setFormValues(defaultValues)
      setTab("basics")
    }
  }, [property, open])

  const setValue = <K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const toNumber = (value: string) => {
    if (!value) return null
    const num = Number(value)
    return Number.isNaN(num) ? null : num
  }

  const buildPayload = (): PropertyInput => ({
    title_en: formValues.title_en,
    title_gr: formValues.title_gr,
    description_en: formValues.description_en,
    description_gr: formValues.description_gr,
    property_type: formValues.property_type,
    listing_type: formValues.listing_type as PropertyInput["listing_type"],
    status: formValues.status as PropertyInput["status"],
    region_id: formValues.region_id || null,
    address_en: formValues.address_en,
    address_gr: formValues.address_gr,
    city_en: formValues.city_en,
    city_gr: formValues.city_gr,
    postal_code: formValues.postal_code,
    price_sale: toNumber(formValues.price_sale),
    price_rent: toNumber(formValues.price_rent),
    currency: formValues.currency,
    bedrooms: toNumber(formValues.bedrooms),
    bathrooms: toNumber(formValues.bathrooms),
    area_sqm: toNumber(formValues.area_sqm),
    plot_size_sqm: toNumber(formValues.plot_size_sqm),
    floor_number: toNumber(formValues.floor_number),
    total_floors: toNumber(formValues.total_floors),
    year_built: toNumber(formValues.year_built),
    energy_rating: formValues.energy_rating || null,
    features: [],
    amenities: [],
    main_image_url: formValues.main_image_url || null,
    tour_3d_url: formValues.tour_3d_url || null,
    video_url: formValues.video_url || null,
    meta_title_en: formValues.meta_title_en,
    meta_title_gr: formValues.meta_title_gr,
    meta_description_en: formValues.meta_description_en,
    meta_description_gr: formValues.meta_description_gr,
    agent_id: null,
    featured: formValues.featured,
    published: formValues.published,
    display_order: Number(formValues.display_order) || 0,
  })

  const handleSubmit = () => {
    const payload = buildPayload()
    startTransition(async () => {
      const result =
        mode === "edit" && property
          ? await updateProperty(property.id, payload)
          : await createProperty(payload)

      if (!result.success) {
        toast.error(result.error || "Failed to save property")
        return
      }

      toast.success(mode === "edit" ? "Property updated" : "Property created")
      onOpenChange(false)
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle>{mode === "edit" ? "Edit Property" : "Create Property"}</SheetTitle>
          <SheetDescription>
            Manage full property details with structured tabs for content, media, energy data, SEO, and documents.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="w-full flex flex-wrap justify-start">
              {["basics", "specs", "media", "energy", "seo", "documents"].map((value) => (
                <TabsTrigger key={value} value={value} className="capitalize">
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basics" className="space-y-4">
              <Section title="Basic Content" description="Titles and descriptions in EN/GR.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Title (EN)" required>
                    <Input value={formValues.title_en} onChange={(e) => setValue("title_en", e.target.value)} />
                  </Field>
                  <Field label="Title (GR)" required>
                    <Input value={formValues.title_gr} onChange={(e) => setValue("title_gr", e.target.value)} />
                  </Field>
                </div>
                <Field label="Description (EN)">
                  <Textarea rows={4} value={formValues.description_en} onChange={(e) => setValue("description_en", e.target.value)} />
                </Field>
                <Field label="Description (GR)">
                  <Textarea rows={4} value={formValues.description_gr} onChange={(e) => setValue("description_gr", e.target.value)} />
                </Field>
              </Section>

              <Separator />

              <Section title="Classification" description="Property type, listing type and status.">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Property Type">
                    <Select value={formValues.property_type} onValueChange={(value) => setValue("property_type", value)}>
                      <SelectTrigger>
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
                  </Field>
                  <Field label="Listing Type">
                    <Select value={formValues.listing_type} onValueChange={(value) => setValue("listing_type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={formValues.status} onValueChange={(value) => setValue("status", value)}>
                      <SelectTrigger>
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
                  </Field>
                </div>
              </Section>

              <Separator />

              <Section title="Location & Pricing" description="Addresses, city, postal code, sale/rent pricing.">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Address (EN)">
                    <Input value={formValues.address_en} onChange={(e) => setValue("address_en", e.target.value)} />
                  </Field>
                  <Field label="Address (GR)">
                    <Input value={formValues.address_gr} onChange={(e) => setValue("address_gr", e.target.value)} />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="City (EN)">
                    <Input value={formValues.city_en} onChange={(e) => setValue("city_en", e.target.value)} />
                  </Field>
                  <Field label="City (GR)">
                    <Input value={formValues.city_gr} onChange={(e) => setValue("city_gr", e.target.value)} />
                  </Field>
                  <Field label="Postal Code">
                    <Input value={formValues.postal_code} onChange={(e) => setValue("postal_code", e.target.value)} />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Sale Price">
                    <Input type="number" value={formValues.price_sale} onChange={(e) => setValue("price_sale", e.target.value)} />
                  </Field>
                  <Field label="Rent Price">
                    <Input type="number" value={formValues.price_rent} onChange={(e) => setValue("price_rent", e.target.value)} />
                  </Field>
                  <Field label="Currency">
                    <Select value={formValues.currency} onValueChange={(value) => setValue("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <Section title="Specifications" description="Beds, baths, area, floors, year built.">
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Bedrooms">
                    <Input value={formValues.bedrooms} onChange={(e) => setValue("bedrooms", e.target.value)} type="number" min="0" />
                  </Field>
                  <Field label="Bathrooms">
                    <Input value={formValues.bathrooms} onChange={(e) => setValue("bathrooms", e.target.value)} type="number" min="0" />
                  </Field>
                  <Field label="Area (sqm)">
                    <Input value={formValues.area_sqm} onChange={(e) => setValue("area_sqm", e.target.value)} type="number" min="0" />
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Plot Size (sqm)">
                    <Input value={formValues.plot_size_sqm} onChange={(e) => setValue("plot_size_sqm", e.target.value)} type="number" min="0" />
                  </Field>
                  <Field label="Floor Number">
                    <Input value={formValues.floor_number} onChange={(e) => setValue("floor_number", e.target.value)} type="number" min="0" />
                  </Field>
                  <Field label="Total Floors">
                    <Input value={formValues.total_floors} onChange={(e) => setValue("total_floors", e.target.value)} type="number" min="0" />
                  </Field>
                </div>
                <Field label="Year Built">
                  <Input value={formValues.year_built} onChange={(e) => setValue("year_built", e.target.value)} type="number" min="1800" max="2100" />
                </Field>
              </Section>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Section title="Media" description="Property images, 3D tours, video links.">
                {property?.id && (
                  <div className="space-y-2">
                    <Label>Property Images</Label>
                    <AdminPropertyImageUploader
                      propertyId={property.id}
                      onImagesChange={(images) => {
                        // Images are automatically saved to database
                        console.log("Images updated:", images)
                      }}
                    />
                  </div>
                )}
                {!property?.id && (
                  <p className="text-sm text-muted-foreground">
                    Save the property first to upload images.
                  </p>
                )}
                <Field label="Main Image URL">
                  <Input value={formValues.main_image_url} onChange={(e) => setValue("main_image_url", e.target.value)} />
                </Field>
                <Field label="3D Tour URL">
                  <Input value={formValues.tour_3d_url} onChange={(e) => setValue("tour_3d_url", e.target.value)} />
                </Field>
                <Field label="Video URL">
                  <Input value={formValues.video_url} onChange={(e) => setValue("video_url", e.target.value)} />
                </Field>
              </Section>
            </TabsContent>

            <TabsContent value="energy" className="space-y-4">
              <Section title="Energy & Sustainability" description="Energy rating and optional notes.">
                <Field label="Energy Rating">
                  <Input value={formValues.energy_rating} onChange={(e) => setValue("energy_rating", e.target.value)} placeholder="A+, A, B..." />
                </Field>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Featured</p>
                    <p className="text-xs text-muted-foreground">Mark as spotlight hero listing</p>
                  </div>
                  <Switch checked={formValues.featured} onCheckedChange={(checked) => setValue("featured", checked)} />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Published</p>
                    <p className="text-xs text-muted-foreground">Visible on the public site</p>
                  </div>
                  <Switch checked={formValues.published} onCheckedChange={(checked) => setValue("published", checked)} />
                </div>
              </Section>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Section title="SEO Metadata" description="Meta titles & descriptions for EN/GR.">
                <Field label="Meta Title (EN)">
                  <Input value={formValues.meta_title_en} onChange={(e) => setValue("meta_title_en", e.target.value)} />
                </Field>
                <Field label="Meta Title (GR)">
                  <Input value={formValues.meta_title_gr} onChange={(e) => setValue("meta_title_gr", e.target.value)} />
                </Field>
                <Field label="Meta Description (EN)">
                  <Textarea rows={3} value={formValues.meta_description_en} onChange={(e) => setValue("meta_description_en", e.target.value)} />
                </Field>
                <Field label="Meta Description (GR)">
                  <Textarea rows={3} value={formValues.meta_description_gr} onChange={(e) => setValue("meta_description_gr", e.target.value)} />
                </Field>
                <Field label="Display Order">
                  <Input type="number" value={formValues.display_order} onChange={(e) => setValue("display_order", e.target.value)} />
                </Field>
              </Section>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Section
                title="Documents"
                description="Attach PDFs, energy certificates, floor plans. Detailed document uploader tracked in future task."
              >
                <Field label="Document Links / Notes">
                  <Textarea
                    rows={6}
                    placeholder="Paste document URLs or notes. Full document manager shipping with properties-6."
                    value={formValues.documents}
                    onChange={(e) => setValue("documents", e.target.value)}
                  />
                </Field>
              </Section>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6 gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Property"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  )
}

