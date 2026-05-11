import { prisma } from "@/lib/prisma";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type NotifyContext = {
  event: string;
  requestId?: string;
};

const BRAND_NAME = "AutoSAV";
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function buildSubject(title: string) {
  return `[${BRAND_NAME}] ${title}`;
}

function buildText(content: string) {
  return `${content}\n\n--\n${BRAND_NAME} notifications`;
}

function buildHtmlEmail(params: {
  title: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const { title, message, ctaLabel, ctaUrl } = params;
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<a href="${ctaUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">${ctaLabel}</a>`
      : "";

  return `
  <div style="background:#f1f5f9;padding:24px;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0f172a,#1d4ed8);padding:18px 20px;color:#ffffff;">
        <div style="font-size:18px;font-weight:700;">${BRAND_NAME}</div>
        <div style="opacity:0.9;font-size:13px;">Marketplace notifications</div>
      </div>
      <div style="padding:22px;">
        <h2 style="margin:0 0 12px 0;font-size:20px;line-height:1.3;">${title}</h2>
        <p style="margin:0 0 18px 0;font-size:14px;line-height:1.7;color:#334155;">${message}</p>
        ${ctaBlock}
      </div>
      <div style="border-top:1px solid #e2e8f0;padding:12px 22px;font-size:12px;color:#64748b;">
        ${BRAND_NAME} â€¢ This is an automated message.
      </div>
    </div>
  </div>`;
}

async function logNotification(data: {
  event: string;
  toEmail: string;
  subject: string;
  provider: string;
  status: "SENT" | "FAILED" | "MOCK";
  requestId?: string;
  error?: string;
}) {
  await prisma.notificationLog
    .create({
      data: {
        event: data.event,
        toEmail: data.toEmail,
        subject: data.subject,
        provider: data.provider,
        status: data.status,
        requestId: data.requestId,
        error: data.error,
      },
    })
    .catch((logError) => {
      console.error("NotificationLog error:", logError);
    });
}

async function sendEmail(payload: EmailPayload, context: NotifyContext) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;

  if (resendApiKey && resendFrom) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        await logNotification({
          event: context.event,
          toEmail: payload.to,
          subject: payload.subject,
          provider: "resend",
          status: "FAILED",
          requestId: context.requestId,
          error: `Resend error (${response.status}): ${details}`,
        });
        throw new Error(`Resend error (${response.status}): ${details}`);
      }

      await logNotification({
        event: context.event,
        toEmail: payload.to,
        subject: payload.subject,
        provider: "resend",
        status: "SENT",
        requestId: context.requestId,
      });
      return;
    } catch (error: any) {
      await logNotification({
        event: context.event,
        toEmail: payload.to,
        subject: payload.subject,
        provider: "resend",
        status: "FAILED",
        requestId: context.requestId,
        error: error?.message || "Unknown error",
      });
      throw error;
    }
  }

  // Safe fallback for local/dev environments.
  console.info(
    `[email:mock] to=${payload.to} subject=${payload.subject} text=${payload.text}`
  );

  await logNotification({
    event: context.event,
    toEmail: payload.to,
    subject: payload.subject,
    provider: "mock",
    status: "MOCK",
    requestId: context.requestId,
  });
}

export async function sendTestNotificationEmail(to: string, adminName?: string | null) {
  const name = adminName || "Admin";
  const message = `Hello ${name}, this is a test notification email.`;
  await sendEmail({
    to,
    subject: buildSubject("Test notification"),
    text: buildText(message),
    html: buildHtmlEmail({
      title: "Test notification",
      message,
      ctaLabel: "Open dashboard",
      ctaUrl: `${APP_BASE_URL}/admin/dashboard`,
    }),
  }, { event: "TEST_NOTIFICATION" });
}

export async function notifyOfferSubmitted(requestId: string, agentBuyerName?: string | null) {
  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { email: true, name: true } },
    },
  });

  if (!request) return;

  const who = agentBuyerName || "Un offreur";
  const message = `${who} a soumis une offre pour votre demande \"${request.title}\".`;
  await sendEmail({
    to: request.requester.email,
    subject: buildSubject(`Nouvelle offre: ${request.title}`),
    text: buildText(message),
    html: buildHtmlEmail({
      title: `Nouvelle offre: ${request.title}`,
      message,
      ctaLabel: "Voir la demande",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "OFFER_SUBMITTED", requestId });
}

export async function notifyOfferAccepted(requestId: string) {
  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { email: true, name: true } },
      acceptedOffer: {
        include: {
          provider: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!request || !request.acceptedOffer) return;

  const agentBuyerMessage = `Le demandeur ${request.requester.name} a accepte votre offre. Le paiement est en attente de blocage.`;

  await sendEmail({
    to: request.acceptedOffer.provider.email,
    subject: buildSubject(`Offre acceptee: ${request.title}`),
    text: buildText(agentBuyerMessage),
    html: buildHtmlEmail({
      title: `Offre acceptee: ${request.title}`,
      message: agentBuyerMessage,
      ctaLabel: "Voir la demande",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "OFFER_ACCEPTED_PROVIDER", requestId });

  const clientMessage = `Vous avez accepte une offre. Veuillez confirmer le blocage des fonds pour demarrer l'achat.`;
  await sendEmail({
    to: request.requester.email,
    subject: buildSubject(`Offre acceptee: ${request.title}`),
    text: buildText(clientMessage),
    html: buildHtmlEmail({
      title: `Offre acceptee: ${request.title}`,
      message: clientMessage,
      ctaLabel: "Confirmer le paiement",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "OFFER_ACCEPTED_REQUESTER", requestId });
}

export async function notifyPaymentHeld(requestId: string) {
  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: {
      acceptedOffer: {
        include: {
          provider: { select: { email: true, name: true } },
        },
      },
      requester: { select: { name: true } },
    },
  });

  if (!request || !request.acceptedOffer) return;

  const message = `Le demandeur ${request.requester.name} a bloque les fonds. Vous pouvez proceder a l'achat et a l'expedition.`;

  await sendEmail({
    to: request.acceptedOffer.provider.email,
    subject: buildSubject(`Fonds bloques: ${request.title}`),
    text: buildText(message),
    html: buildHtmlEmail({
      title: `Fonds bloques: ${request.title}`,
      message,
      ctaLabel: "Voir la commande",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "PAYMENT_HELD", requestId });
}

export async function notifyShipmentStatus(requestId: string, event: "SHIPPED" | "DELIVERED") {
  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { email: true, name: true } },
      acceptedOffer: {
        include: {
          provider: { select: { email: true, name: true } },
        },
      },
      shipment: true,
    },
  });

  if (!request || !request.acceptedOffer) return;

  if (event === "SHIPPED") {
    const tracking = request.shipment?.trackingNumber
      ? ` Tracking: ${request.shipment.trackingNumber}.`
      : "";
    const message = `${request.acceptedOffer.provider.name} a marque votre commande comme expediee.${tracking}`;
    await sendEmail({
      to: request.requester.email,
      subject: buildSubject(`Produit expedie: ${request.title}`),
      text: buildText(message),
      html: buildHtmlEmail({
        title: `Produit expedie: ${request.title}`,
        message,
        ctaLabel: "Suivre la commande",
        ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
      }),
    }, { event: "SHIPMENT_SHIPPED", requestId });
    return;
  }

  const deliveredMessage = "Votre commande est marquee comme livree. Merci de confirmer la reception pour liberer le paiement.";

  await sendEmail({
    to: request.requester.email,
    subject: buildSubject(`Commande livree: ${request.title}`),
    text: buildText(deliveredMessage),
    html: buildHtmlEmail({
      title: `Commande livree: ${request.title}`,
      message: deliveredMessage,
      ctaLabel: "Confirmer la reception",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "SHIPMENT_DELIVERED", requestId });
}

export async function notifyPaymentReleased(requestId: string) {
  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { email: true } },
      acceptedOffer: {
        include: {
          provider: { select: { email: true, name: true } },
        },
      },
      transaction: true,
    },
  });

  if (!request || !request.acceptedOffer || !request.transaction) return;

  const agentBuyerMessage = `Le demandeur a confirme la reception. Votre paiement de ${request.transaction.amount} DZD est libere.`;

  await sendEmail({
    to: request.acceptedOffer.provider.email,
    subject: buildSubject(`Paiement libere: ${request.title}`),
    text: buildText(agentBuyerMessage),
    html: buildHtmlEmail({
      title: `Paiement libere: ${request.title}`,
      message: agentBuyerMessage,
      ctaLabel: "Voir la transaction",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "PAYMENT_RELEASED_PROVIDER", requestId });

  const clientMessage = "Le paiement a ete libere au fournisseur suite a votre confirmation de livraison.";
  await sendEmail({
    to: request.requester.email,
    subject: buildSubject(`Paiement libere: ${request.title}`),
    text: buildText(clientMessage),
    html: buildHtmlEmail({
      title: `Paiement libere: ${request.title}`,
      message: clientMessage,
      ctaLabel: "Retour au detail",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "PAYMENT_RELEASED_REQUESTER", requestId });
}

export async function notifyDisputeOpened(requestId: string, reason: string) {
  const request = await prisma.productRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: { select: { email: true, name: true } },
      acceptedOffer: {
        include: {
          provider: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!request) return;

  const subject = buildSubject(`Litige ouvert: ${request.title}`);
  const message = `Un litige a ete ouvert pour "${request.title}". Raison: ${reason}`;

  await sendEmail({
    to: request.requester.email,
    subject,
    text: buildText(message),
    html: buildHtmlEmail({
      title: `Litige ouvert: ${request.title}`,
      message,
      ctaLabel: "Voir la demande",
      ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
    }),
  }, { event: "DISPUTE_OPENED_REQUESTER", requestId });

  if (request.acceptedOffer?.provider?.email) {
    await sendEmail({
      to: request.acceptedOffer.provider.email,
      subject,
      text: buildText(message),
      html: buildHtmlEmail({
        title: `Litige ouvert: ${request.title}`,
        message,
        ctaLabel: "Voir la demande",
        ctaUrl: `${APP_BASE_URL}/request/${requestId}`,
      }),
    }, { event: "DISPUTE_OPENED_PROVIDER", requestId });
  }
}

export async function notifyTransactionMessage(params: {
  requestId: string;
  senderId: string;
  message: string;
  recipientEmail: string;
  recipientName: string;
}) {
  const request = await prisma.productRequest.findUnique({
    where: { id: params.requestId },
    select: { title: true },
  });

  if (!request) return;

  const preview = params.message.length > 120 ? `${params.message.slice(0, 117)}...` : params.message;

  await sendEmail({
    to: params.recipientEmail,
    subject: buildSubject(`Nouveau message: ${request.title}`),
    text: buildText(`Nouveau message sur "${request.title}": ${preview}`),
    html: buildHtmlEmail({
      title: `Nouveau message: ${request.title}`,
      message: `Nouveau message sur "${request.title}": ${preview}`,
      ctaLabel: "Ouvrir la demande",
      ctaUrl: `${APP_BASE_URL}/request/${params.requestId}`,
    }),
  }, { event: "TRANSACTION_MESSAGE", requestId: params.requestId });
}

