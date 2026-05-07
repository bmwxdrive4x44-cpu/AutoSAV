"use client";

import { useState } from "react";
import Link from "next/link";
import { getPartRequests, getOffersForRequest, submitOffer } from "../../lib/marketplace.js";

export default function SellerPage() {
  const [requests, setRequests] = useState(() => getPartRequests());

  function onOfferSubmit(event, requestId) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = String(formData.get("amount") || "").trim();
    const seller = String(formData.get("seller") || "").trim();

    if (!amount || !seller) {
      return;
    }

    submitOffer({ requestId, amount, seller });
    event.currentTarget.reset();
    setRequests(getPartRequests());
  }

  return (
    <main className="page">
      <section className="card">
        <p className="muted">Role: Seller</p>
        <h1>Seller dashboard</h1>
        <p>Review client requests and send quick offers.</p>
      </section>
      <section className="stack">
        {requests.length === 0 ? (
          <article className="card">
            <p>No requests yet. Ask clients to create one.</p>
          </article>
        ) : (
          requests.map((request) => {
            const offers = getOffersForRequest(request.id);
            return (
              <article className="card" key={request.id}>
                <h2>{request.partName}</h2>
                <p>
                  <strong>Location:</strong> {request.location}
                </p>
                {request.details ? (
                  <p>
                    <strong>Details:</strong> {request.details}
                  </p>
                ) : null}
                <form className="stack" onSubmit={(event) => onOfferSubmit(event, request.id)}>
                  <input className="input" name="amount" placeholder="Offer price (DZD)" required />
                  <input className="input" name="seller" placeholder="Seller name" required />
                  <button className="button secondary" type="submit">
                    Send offer
                  </button>
                </form>
                {offers.length > 0 ? (
                  <div className="offers">
                    <p className="muted">Offers:</p>
                    <ul>
                      {offers.map((offer) => (
                        <li key={offer.id}>
                          {offer.amount} by {offer.seller}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="muted">No offers yet.</p>
                )}
              </article>
            );
          })
        )}
      </section>
      <Link className="link" href="/">
        Back to home
      </Link>
    </main>
  );
}
