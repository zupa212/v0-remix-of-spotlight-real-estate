"use client"

import { FileText, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PropertyDocument {
  id: string
  document_url: string
  document_type: string
  title_en: string | null
  title_gr: string | null
  file_size_kb: number | null
}

interface PropertyDocumentsProps {
  documents: PropertyDocument[]
}

const documentTypeLabels: Record<string, string> = {
  brochure: "Brochure",
  floorplan: "Floor Plan",
  certificate: "Certificate",
  other: "Document",
}

const documentTypeColors: Record<string, string> = {
  brochure: "bg-blue-100 text-blue-800",
  floorplan: "bg-green-100 text-green-800",
  certificate: "bg-purple-100 text-purple-800",
  other: "bg-slate-100 text-slate-800",
}

export function PropertyDocuments({ documents }: PropertyDocumentsProps) {
  if (documents.length === 0) {
    return null
  }

  const formatFileSize = (kb: number | null) => {
    if (!kb) return ""
    if (kb < 1024) return `${kb} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  return (
    <Card className="border-[#E0E0E0]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border border-[#E0E0E0] rounded-lg hover:bg-[#F8F8F8] transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#333333]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#333333] truncate">
                    {doc.title_en || doc.title_gr || documentTypeLabels[doc.document_type] || "Document"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={`${documentTypeColors[doc.document_type] || documentTypeColors.other} border-0 text-xs`}
                    >
                      {documentTypeLabels[doc.document_type] || "Document"}
                    </Badge>
                    {doc.file_size_kb && (
                      <span className="text-xs text-[#666666]">{formatFileSize(doc.file_size_kb)}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-[#E0E0E0] hover:bg-[#F8F8F8]"
                >
                  <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-[#E0E0E0] hover:bg-[#F8F8F8]"
                >
                  <a href={doc.document_url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

