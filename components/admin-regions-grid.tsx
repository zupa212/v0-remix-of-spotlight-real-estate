"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRegions, type Region } from "@/lib/hooks/use-regions"
import { AdminEmptyState } from "@/components/admin-empty-state"

interface AdminRegionsGridProps {
  onEditRegion?: (region: Region) => void
}

export function AdminRegionsGrid({ onEditRegion }: AdminRegionsGridProps) {
  const { data: regions, isLoading, isError, error, refetch } = useRegions()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load regions. {error?.message}
      </div>
    )
  }

  if (!regions || regions.length === 0) {
    return (
      <AdminEmptyState
        icon={MapPin}
        title="No regions yet"
        description="Get started by adding your first region."
        actionLabel="Add Region"
        onAction={() => {
          window.location.href = "/admin/regions/new"
        }}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {regions.map((region) => (
        <Card key={region.id} className="hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="p-0 relative h-48">
            {region.image_url ? (
              <Image
                src={region.image_url}
                alt={region.name_en}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {region.featured && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{region.name_en}</h3>
              {region.display_order !== null && (
                <Badge variant="outline" className="text-xs">
                  #{region.display_order}
                </Badge>
              )}
            </div>
            {region.name_gr && (
              <p className="text-sm text-muted-foreground mb-2">{region.name_gr}</p>
            )}
            {region.description_en && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {region.description_en}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEditRegion?.(region)}
              >
                Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/admin/regions/${region.id}`}>View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


