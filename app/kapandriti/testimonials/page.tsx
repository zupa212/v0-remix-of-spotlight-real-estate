import { Metadata } from "next"
import { TestimonialsHomePage } from "@/components/kapandriti/TestimonialsHomePage"

export const metadata: Metadata = {
    title: "Kapandriti Selection | Before & After",
    description: "View the transformation potential of this 336sqm Kapandriti residence.",
}

export default function Page() {
    return <TestimonialsHomePage />
}
