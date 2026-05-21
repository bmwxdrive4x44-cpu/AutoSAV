import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <div className="surface-card p-6 text-sm text-slate-600">Utilisateur non trouve.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <p className="text-sm text-slate-500 mt-1">Gere tes informations personnelles et ta localisation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <User className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Nom</p>
              <p className="font-semibold">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Mail className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <Phone className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Téléphone</p>
              <p className="font-semibold">{user.phone || <span className="italic text-slate-400">Non renseigné</span>}</p>
            </div>
          </div>

          {/* Localisation sera visible après la migration DB */}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/dashboard/profile/edit"><Button>Modifier mon profil</Button></Link>
        <Link href="/dashboard/profile/password"><Button variant="outline">Changer le mot de passe</Button></Link>
      </div>

      <div className="rounded-md border border-primary-100 bg-primary-50 p-4 text-xs text-slate-600">
        <p className="mb-2 font-semibold">Informations importantes</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Renseignez votre pays et votre ville pour que les demandeurs sachent où vous êtes basé.</li>
          <li>Ces informations apparaîtront sur les offres que vous soumettez.</li>
        </ul>
      </div>
    </div>
  );
}
