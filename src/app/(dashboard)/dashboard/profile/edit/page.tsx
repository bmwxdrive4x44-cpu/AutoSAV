import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateProfileForm } from "@/components/profile/update-profile-form";

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <div className="surface-card p-6 text-sm text-slate-600">Utilisateur non trouve.</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modifier mes informations</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
