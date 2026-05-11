"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOffer } from "@/app/actions/offers";

export function SubmitOfferForm({ requestId }: { requestId: string }) {
  const [pending, setPending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createOffer(formData);
      setShowForm(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPending(false);
    }
  }

  if (!showForm) {
    return (
      <Button className="w-full" onClick={() => setShowForm(true)}>
        Faire une offre
      </Button>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-slate-50">
      <input type="hidden" name="requestId" value={requestId} />
      <h3 className="font-semibold text-sm">Nouvelle offre</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Prix proposÃ© (DZD)</Label>
          <Input id="price" name="price" type="number" min="1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDeliveryDays">DÃ©lai (jours)</Label>
          <Input id="estimatedDeliveryDays" name="estimatedDeliveryDays" type="number" min="1" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="PrÃ©cisez votre offre, disponibilitÃ©, etc."
          required
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={pending}>
          {pending ? "Envoi..." : "Envoyer l'offre"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

