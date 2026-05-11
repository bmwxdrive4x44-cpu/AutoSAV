import { redirect } from "next/navigation";

export default function LegacyClientOffersPage() {
  redirect("/dashboard/offers-received");
}
