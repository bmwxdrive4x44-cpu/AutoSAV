import { CreateRequestForm } from "@/components/requests/create-request-form";
import { getCategories } from "@/app/actions/categories";

export const dynamic = "force-dynamic";

export default async function CreateRequestPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Creer une demande</h1>
      <CreateRequestForm categories={categories} />
    </div>
  );
}

