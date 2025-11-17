export interface LeadScoringInput {
  budget_fit?: number | null
  readiness?: number | null
  region_match?: boolean | null
  property_code?: string | null
}

export function scoreLead(input: LeadScoringInput): {
  score: number
  label: "Hot" | "Warm" | "Cold"
  variant: "destructive" | "default" | "secondary"
} {
  let score = 0

  // Budget fit (0-40 points)
  if (input.budget_fit !== null && input.budget_fit !== undefined) {
    score += Math.min(input.budget_fit * 0.4, 40)
  }

  // Readiness (0-40 points)
  if (input.readiness !== null && input.readiness !== undefined) {
    score += Math.min(input.readiness * 0.4, 40)
  }

  // Region match (0-10 points)
  if (input.region_match) {
    score += 10
  }

  // Property code exists (0-10 points)
  if (input.property_code) {
    score += 10
  }

  const finalScore = Math.round(Math.min(score, 100))

  if (finalScore >= 75) {
    return { score: finalScore, label: "Hot", variant: "destructive" }
  } else if (finalScore >= 50) {
    return { score: finalScore, label: "Warm", variant: "default" }
  } else {
    return { score: finalScore, label: "Cold", variant: "secondary" }
  }
}


