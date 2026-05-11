import { redirect } from "next/navigation";

export default function LegacyIntermediaryShipmentsPage() {
  redirect("/dashboard/deliveries");
}
