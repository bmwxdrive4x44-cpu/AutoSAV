"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendTransactionChatMessage } from "@/app/actions/transaction-chat";
import { formatDateTimeStable } from "@/lib/utils";

type ChatMessage = {
  id: string;
  senderName: string;
  senderRole: string;
  senderTrustScore: number | null;
  body: string;
  createdAt: string;
  offerId: string | null;
  offerPrice: number | null;
};

type ChatOffer = {
  id: string;
  price: number;
  status: string;
  provider: { name: string };
};

interface TransactionChatPanelProps {
  requestId: string;
  canSend: boolean;
  defaultOfferId: string | null;
  messages: ChatMessage[];
  offers: ChatOffer[];
}

export function TransactionChatPanel({
  requestId,
  canSend,
  defaultOfferId,
  messages,
  offers,
}: TransactionChatPanelProps) {
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [selectedOfferId, setSelectedOfferId] = useState(defaultOfferId || offers[0]?.id || "");

  const offerById = useMemo(() => new Map(offers.map((offer) => [offer.id, offer])), [offers]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">Chat transactionnel</h2>
        <p className="mt-1 text-sm text-slate-600">
          Messages simples liés à une demande et à une offre pour négocier, demander des photos ou des preuves.
        </p>
      </div>

      <div className="max-h-[24rem] space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Aucun message pour cette transaction.
          </div>
        ) : (
          messages.map((message) => {
            const relatedOffer = message.offerId ? offerById.get(message.offerId) : null;
            const isRequester = message.senderRole === "CLIENT" || message.senderRole === "USER";

            return (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-2xl border px-3 py-3 sm:max-w-[82%] ${
                  isRequester ? "ml-auto border-indigo-200 bg-indigo-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">{message.senderName}</span>
                  <span>{formatDateTimeStable(message.createdAt)}</span>
                  {message.senderTrustScore != null && <span>Score {message.senderTrustScore}/100</span>}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{message.body}</p>
                {relatedOffer && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Offre liée: {relatedOffer.provider.name} - {Math.floor(relatedOffer.price)} DZD
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
        {canSend ? (
          <form
            action={async (formData) => {
              formData.set("requestId", requestId);
              formData.set("offerId", selectedOfferId || "");
              await sendTransactionChatMessage(formData);
              setBody("");
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="chatOfferId">Lier à une offre</Label>
              <select
                id="chatOfferId"
                name="offerId"
                value={selectedOfferId}
                onChange={(event) => setSelectedOfferId(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.provider.name} - {Math.floor(offer.price)} DZD ({offer.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatMessage">Message</Label>
              <Textarea
                id="chatMessage"
                name="message"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                placeholder="Écrivez une question, une précision ou demandez une preuve..."
                required
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="submit" disabled={pending || !body.trim()}>
                {pending ? "Envoi..." : "Envoyer le message"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Le chat est réservé aux parties impliquées dans la demande et ses offres.
          </div>
        )}
      </div>
    </section>
  );
}
