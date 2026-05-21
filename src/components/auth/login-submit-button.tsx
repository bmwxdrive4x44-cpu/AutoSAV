"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type LoginSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function LoginSubmitButton({ idleLabel, pendingLabel }: LoginSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {pendingLabel}
        </span>
      ) : (
        idleLabel
      )}
    </Button>
  );
}
