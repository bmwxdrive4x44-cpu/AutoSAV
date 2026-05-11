"use client";

import { useState } from "react";
import {
  deleteOffer,
  suspendOfferAgent,
  reportOfferAsAbuse,
  markOfferAsSuspicious,
} from "@/app/actions/admin";

interface OffersManagementProps {
  offers: any[];
  onReload: () => Promise<void>;
}

export function OffersManagement({ offers, onReload }: OffersManagementProps) {
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({});

  function askReason(title: string, defaultValue: string): string | null {
    const value = window.prompt(title, defaultValue);
    if (value == null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async function handleAction(offerId: string, action: () => Promise<any>) {
    setActionPending((prev) => ({ ...prev, [offerId]: true }));
    try {
      await action();
      await onReload();
    } finally {
      setActionPending((prev) => ({ ...prev, [offerId]: false }));
    }
  }

  const deletedOffers = offers.filter((o) => o.deletedAt);
  const suspiciousOffers = offers.filter((o) => o.isSuspicious && !o.deletedAt);
  const abusiveOffers = offers.filter((o) => o.isReportedAsAbuse && !o.deletedAt);

  // DÃ©tecte les prix extrÃªmes (valeurs aberrantes)
  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const stdDev = prices.length > 0
    ? Math.sqrt(prices.reduce((sq, n) => sq + Math.pow(n - avgPrice, 2), 0) / prices.length)
    : 0;
  const extremePriceOffers = offers.filter(
    (o) => !o.deletedAt && Math.abs(o.price - avgPrice) > 2.5 * stdDev
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <p className="text-sm text-slate-600">Total offres</p>
          <p className="text-2xl font-bold text-slate-900">{offers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">Offres suspectes</p>
          <p className="text-2xl font-bold text-amber-900">{suspiciousOffers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">SignalÃ©es abusives</p>
          <p className="text-2xl font-bold text-red-900">{abusiveOffers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-orange-200 bg-orange-50">
          <p className="text-sm text-orange-700">Prix extrÃªmes</p>
          <p className="text-2xl font-bold text-orange-900">{extremePriceOffers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-700">Offres supprimÃ©es</p>
          <p className="text-2xl font-bold text-slate-900">{deletedOffers.length}</p>
        </div>
      </div>

      {/* Archived deleted offers */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Offres supprimÃ©es ({deletedOffers.length})</h3>
        </div>
        {deletedOffers.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune offre supprimÃ©e.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Demande</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Raison suppression</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deletedOffers.map((offer) => (
                <tr key={offer.id} className="bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{offer.request?.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{offer.provider?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(offer.price)} DZD</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{offer.deletionReason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Suspicious Offers */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
          <h3 className="text-base font-semibold text-amber-900">Offres suspectes ({suspiciousOffers.length})</h3>
        </div>
        {suspiciousOffers.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune offre suspecte.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Demande</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Raison</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suspiciousOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{offer.request?.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{offer.provider?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(offer.price)} DZD</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{offer.suspiciousReason || "-"}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer la suspension de cet agent ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison de suspension :",
                            "Agent suspendu pour offre suspecte"
                          );
                          if (!reason) return;
                          return handleAction(offer.id, () => suspendOfferAgent(offer.providerId, reason));
                        }}
                        disabled={!!actionPending[offer.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Suspendre agent
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer le signalement de cette offre comme abusive ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison du signalement :",
                            "Signalement admin pour comportement abusif"
                          );
                          if (!reason) return;
                          return handleAction(offer.id, () => reportOfferAsAbuse(offer.id, reason));
                        }}
                        disabled={!!actionPending[offer.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                      >
                        Signaler abus
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer la suppression de cette offre ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison de suppression :",
                            "Offre supprimÃ©e par modÃ©ration admin"
                          );
                          if (!reason) return;
                          return handleAction(offer.id, () => deleteOffer(offer.id, reason));
                        }}
                        disabled={!!actionPending[offer.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Extreme Price Offers */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
          <h3 className="text-base font-semibold text-orange-900">Offres avec prix extrÃªmes ({extremePriceOffers.length})</h3>
          <p className="text-xs text-orange-700">Moyenne: {Math.floor(avgPrice)} DZD</p>
        </div>
        {extremePriceOffers.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune offre avec prix extrÃªme.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Demande</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Ã‰cart</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {extremePriceOffers.map((offer) => {
                const deviation = Math.round(((offer.price - avgPrice) / avgPrice) * 100);
                return (
                  <tr key={offer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-800 font-medium">{offer.request?.title}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{offer.provider?.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{Math.floor(offer.price)} DZD</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        deviation > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {deviation > 0 ? "+" : ""}{deviation}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!window.confirm("Confirmer le marquage de cette offre comme suspecte ?")) {
                              return;
                            }
                            const reason = askReason(
                              "Raison du marquage suspect :",
                              "Prix extreme detecte"
                            );
                            if (!reason) return;
                            return handleAction(offer.id, () => markOfferAsSuspicious(offer.id, reason));
                          }}
                          disabled={!!actionPending[offer.id]}
                          className="px-2 py-1 rounded text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                        >
                          Marquer suspect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reported as Abuse */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <h3 className="text-base font-semibold text-red-900">SignalÃ©es comme abusives ({abusiveOffers.length})</h3>
        </div>
        {abusiveOffers.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Aucune offre signalÃ©e comme abusive.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Demande</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Raison</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {abusiveOffers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-800 font-medium">{offer.request?.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{offer.provider?.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{offer.abuseReason || "-"}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer la suspension de cet agent (abus) ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison de suspension :",
                            "Agent suspendu apres signalement d'abus"
                          );
                          if (!reason) return;
                          return handleAction(offer.id, () => suspendOfferAgent(offer.providerId, reason));
                        }}
                        disabled={!!actionPending[offer.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Suspendre agent
                      </button>
                      <button
                        onClick={() => {
                          if (!window.confirm("Confirmer la suppression de cette offre abusive ?")) {
                            return;
                          }
                          const reason = askReason(
                            "Raison de suppression :",
                            "Offre supprimÃ©e suite Ã  abus"
                          );
                          if (!reason) return;
                          return handleAction(offer.id, () => deleteOffer(offer.id, reason));
                        }}
                        disabled={!!actionPending[offer.id]}
                        className="px-2 py-1 rounded text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

