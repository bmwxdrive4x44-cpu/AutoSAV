"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CategorySelector } from "@/components/categories";
import { createRequest } from "@/app/actions/requests";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CreateRequestFormProps {
  categories: Category[];
}

const countries = [
  "France",
  "Ã‰tats-Unis",
  "Royaume-Uni",
  "Allemagne",
  "Espagne",
  "Italie",
  "Turquie",
  "Chine",
  "Autre",
];

export function CreateRequestForm({ categories }: CreateRequestFormProps) {
  const [pending, setPending] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const submitLockRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    if (submitLockRef.current) return;
    if (!selectedCategoryId) {
      alert("Veuillez choisir une categorie.");
      return;
    }
    
    submitLockRef.current = true;
    setPending(true);
    try {
      // Add categoryId to formData
      formData.set("categoryId", selectedCategoryId);
      await createRequest(formData);
      formRef.current?.reset();
      setSelectedCategoryId("");
      router.refresh();
      alert("Demande publiee avec succes.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Impossible de publier la demande.");
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du produit</Label>
        <Input id="title" name="title" placeholder="Ex: RTX 4070 Ti" minLength={3} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description dÃ©taillÃ©e</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="DÃ©crivez le produit, la rÃ©fÃ©rence, les spÃ©cifications souhaitÃ©es..."
          required
          minLength={10}
          rows={4}
        />
      </div>

      {/* Category Selector */}
      <CategorySelector
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
        name="categoryId"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget (DZD)</Label>
          <Input id="budget" name="budget" type="number" min="1" placeholder="50000" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="countryToBuyFrom">Pays d'achat souhaitÃ©</Label>
          <Select id="countryToBuyFrom" name="countryToBuyFrom" required>
            <option value="">Choisir...</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images (URLs sÃ©parÃ©es par des virgules)</Label>
        <Input
          id="images"
          name="images"
          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
        />
        <p className="text-xs text-slate-500">Optionnel. Collez les liens d'images sÃ©parÃ©s par des virgules.</p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Publication..." : "Publier la demande"}
      </Button>
    </form>
  );
}

