"use client"

import html2canvas from "html2canvas"

/**
 * Export chart as PNG image
 */
export async function exportChartAsPNG(chartElementId: string, filename: string = "chart.png") {
  const element = document.getElementById(chartElementId)
  if (!element) {
    throw new Error("Chart element not found")
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      logging: false,
    })

    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = filename
    link.href = url
    link.click()
  } catch (error) {
    console.error("Failed to export chart as PNG:", error)
    throw error
  }
}

/**
 * Export data as CSV
 */
export function exportDataAsCSV(
  data: any[],
  filename: string = "export.csv",
  headers?: string[]
) {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create CSV content
  const csvRows = [
    csvHeaders.join(","),
    ...data.map((row) =>
      csvHeaders
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value ?? ""
        })
        .join(",")
    ),
  ]

  const csvContent = csvRows.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


