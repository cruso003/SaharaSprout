import { redirect } from "next/navigation"

export default function Home() {
  // For now, redirect to landing page to show the onboarding flow
  // Later, this will check authentication and show dashboard or landing accordingly
  redirect("/landing")
}
