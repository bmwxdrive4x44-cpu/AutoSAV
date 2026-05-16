interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> =
  {
    REQUEST_CREATED: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Nouvelle demande",
    },
    OFFERS_RECEIVED: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Offres reçues",
    },
    OFFER_ACCEPTED: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Offre acceptée",
    },
    PAYMENT_PENDING: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      label: "Paiement en attente",
    },
    PURCHASE_IN_PROGRESS: {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      label: "Achat en cours",
    },
    SHIPPED: {
      bg: "bg-cyan-100",
      text: "text-cyan-800",
      label: "Expédié",
    },
    DELIVERED: {
      bg: "bg-green-200",
      text: "text-green-900",
      label: "Livré",
    },
    PAYMENT_RELEASED: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      label: "Paiement libéré",
    },
  };

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusColors[status] || statusColors["REQUEST_CREATED"];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

