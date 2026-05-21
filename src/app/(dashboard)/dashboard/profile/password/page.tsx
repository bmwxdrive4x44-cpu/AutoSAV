import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="surface-card p-6 text-sm text-slate-600">Utilisateur non trouve.</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Changer mon mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
