import { redirect } from "next/navigation";

export default function LegacyClientRequestsPage() {
  redirect("/dashboard/requests");
}
