"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/profile";
import { OpenStreetMapLocationInput } from "@/components/profile/openstreetmap-location-input";

export function UpdateProfileForm({ user }: { user: { name: string; email: string; phone?: string | null; country?: string | null; city?: string | null } }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState(user.country || "");
  const [city, setCity] = useState(user.city || "");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await updateProfile(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
      </div>
      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={user.phone || ""} placeholder="+213 555 123 456" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <OpenStreetMapLocationInput
          id="country"
          name="country"
          label="Pays"
          placeholder="Ex: Algérie"
          value={country}
          onChange={setCountry}
          type="country"
          required
        />
        <OpenStreetMapLocationInput
          id="city"
          name="city"
          label="Ville"
          placeholder="Ex: Alger"
          value={city}
          onChange={setCity}
          type="city"
          countryHint={country}
          required
        />
      </div>
      <p className="text-xs text-slate-500">
        Les suggestions viennent d’OpenStreetMap pour t’aider à saisir une localisation propre et exploitable.
      </p>
      <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
      {success && <div className="text-green-600">Profil mis à jour !</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}
