import { redirect } from "next/navigation";

export default function LegacyIntermediaryOffersPage() {
  redirect("/dashboard/offers-submitted");
}
