"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOffer } from "@/app/actions/offers";
import { formatPrice } from "@/lib/utils";

export function SubmitOfferForm({ requestId, requestBudget }: { requestId: string; requestBudget?: number }) {
  const [pending, setPending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [priceValue, setPriceValue] = useState("");

  function openAsBudgetAcceptance() {
    if (typeof requestBudget === "number") {
      setPriceValue(String(requestBudget));
    }
    setShowForm(true);
  }

  function openAsCounterOffer() {
    setPriceValue("");
    setShowForm(true);
  }

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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button className="w-full" onClick={openAsBudgetAcceptance}>
          {typeof requestBudget === "number" ? `Accepter le budget (${formatPrice(requestBudget)})` : "Accepter le budget"}
        </Button>
        <Button className="w-full" variant="outline" onClick={openAsCounterOffer}>
          Faire une contre-offre
        </Button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-slate-50">
      <input type="hidden" name="requestId" value={requestId} />
      <h3 className="font-semibold text-sm">Nouvelle offre</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Prix proposé (DZD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="1"
            required
            value={priceValue}
            onChange={(event) => setPriceValue(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDeliveryDays">Délai (jours)</Label>
          <Input id="estimatedDeliveryDays" name="estimatedDeliveryDays" type="number" min="1" required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="routeFromCountry">Pays de depart (optionnel)</Label>
          <Input id="routeFromCountry" name="routeFromCountry" placeholder="Ex: France" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="routeToCountry">Pays d'arrivee (optionnel)</Label>
          <Input id="routeToCountry" name="routeToCountry" placeholder="Ex: Algerie" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="routeFromCity">Ville de depart (optionnel)</Label>
          <Input id="routeFromCity" name="routeFromCity" placeholder="Ex: Marseille" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="routeToCity">Ville d'arrivee (optionnel)</Label>
          <Input id="routeToCity" name="routeToCity" placeholder="Ex: Alger" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departureDate">Date de depart (optionnel)</Label>
          <Input id="departureDate" name="departureDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrivalDate">Date d'arrivee (optionnel)</Label>
          <Input id="arrivalDate" name="arrivalDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacityKg">Capacite dispo (kg)</Label>
          <Input id="capacityKg" name="capacityKg" type="number" min="0.1" step="0.1" placeholder="30" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacityM3">Capacite volume (m3)</Label>
          <Input id="capacityM3" name="capacityM3" type="number" min="0.001" step="0.001" placeholder="0.25" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Précisez votre offre, disponibilité, etc."
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="restrictions">Restrictions éventuelles (optionnel)</Label>
        <Textarea
          id="restrictions"
          name="restrictions"
          placeholder="Ex: pas de liquide, max 1 colis, dimensions limitees"
          rows={2}
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

