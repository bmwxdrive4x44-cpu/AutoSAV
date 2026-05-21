import { CreateRequestForm } from "@/components/requests/create-request-form";
import { getCategories } from "@/app/actions/categories";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CreateRequestPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Creer une demande</h1>
      <Card>
        <CardContent className="p-6">
          <CreateRequestForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

