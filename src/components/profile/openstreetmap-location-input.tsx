"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocationType = "country" | "city";

type NominatimResult = {
  display_name: string;
  address?: {
    country?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
  };
};

interface OpenStreetMapLocationInputProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type: LocationType;
  countryHint?: string;
  required?: boolean;
}

function buildLabel(result: NominatimResult, type: LocationType) {
  if (type === "country") {
    return result.address?.country || result.display_name;
  }

  return (
    result.address?.city ||
    result.address?.town ||
    result.address?.village ||
    result.address?.municipality ||
    result.address?.county ||
    result.display_name.split(",")[0] ||
    result.display_name
  );
}

export function OpenStreetMapLocationInput({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  type,
  countryHint,
  required,
}: OpenStreetMapLocationInputProps) {
  const [query, setQuery] = useState(value);
  const [items, setItems] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchQuery = type === "city" && countryHint ? `${trimmed}, ${countryHint}` : trimmed;
        const params = new URLSearchParams({
          format: "jsonv2",
          addressdetails: "1",
          limit: "6",
          q: searchQuery,
        });

        if (type === "country") {
          params.set("featuretype", "country");
        }

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("OpenStreetMap search failed");
        }

        const results = (await response.json()) as NominatimResult[];
        setItems(results);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [countryHint, query, type]);

  const visibleItems = useMemo(() => items.slice(0, 6), [items]);

  return (
    <div className="relative space-y-2">
      <Label htmlFor={id}>{label}{required ? " *" : ""}</Label>
      <Input
        id={id}
        name={name}
        value={query}
        onChange={(event) => {
          const nextValue = event.target.value;
          setQuery(nextValue);
          onChange(nextValue);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        autoComplete="off"
        required={required}
      />

      {open && (loading || visibleItems.length > 0) && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading && <div className="px-3 py-2 text-sm text-slate-500">Recherche OpenStreetMap...</div>}
          {!loading && visibleItems.map((item) => {
            const labelValue = buildLabel(item, type);
            return (
              <button
                key={item.display_name}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setQuery(labelValue);
                  onChange(labelValue);
                  setOpen(false);
                }}
              >
                <div className="font-medium text-slate-900">{labelValue}</div>
                <div className="text-xs text-slate-500">{item.display_name}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}