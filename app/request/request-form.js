"use client";

import { useState } from "react";
import Link from "next/link";
import { createPartRequest } from "../../lib/marketplace.js";

export default function RequestForm({ requestedPart }) {
  const [message, setMessage] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      partName: String(formData.get("partName") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      details: String(formData.get("details") || "").trim(),
    };

    if (!payload.partName || !payload.location) {
      setMessage("Part name and location are required.");
      return;
    }

    createPartRequest(payload);
    event.currentTarget.reset();
    setMessage("Request sent. Sellers can now reply with offers.");
  }

  return (
    <main className="page">
      <section className="card">
        <p className="muted">Role: Client</p>
        <h1>Create part request</h1>
        <form className="stack" onSubmit={onSubmit}>
          <input
            className="input"
            defaultValue={requestedPart}
            name="partName"
            placeholder="Part name"
            required
          />
          <input className="input" name="location" placeholder="City (Algeria)" required />
          <textarea className="input textarea" name="details" placeholder="Optional notes" />
          <button className="button" type="submit">
            Send request
          </button>
        </form>
        {message ? <p>{message}</p> : null}
      </section>
      <Link className="link" href="/seller">
        Go to seller dashboard
      </Link>
    </main>
  );
}
