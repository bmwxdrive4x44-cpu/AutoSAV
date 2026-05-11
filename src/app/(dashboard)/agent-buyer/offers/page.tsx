import { redirect } from "next/navigation";

export default function LegacyAgentBuyerOffersPage() {
  redirect("/dashboard/offers-submitted");
}
