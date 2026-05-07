import Link from "next/link";
import { filterParts } from "../../lib/marketplace.js";

export default async function ResultsPage({ searchParams }) {
  const params = await searchParams;
  const query = (params?.q || "").trim();
  const results = filterParts(query);

  return (
    <main className="page">
      <section className="card">
        <h1>Search results</h1>
        <p className="muted">Query: {query || "none"}</p>
      </section>
      {results.length > 0 ? (
        <section className="stack">
          {results.map((part) => (
            <article className="card" key={part.id}>
              <h2>{part.name}</h2>
              <p>
                <strong>Price:</strong> {part.price}
              </p>
              <p>
                <strong>Condition:</strong> {part.condition}
              </p>
              <p>
                <strong>Location:</strong> {part.location}
              </p>
              <p>
                <strong>Seller:</strong> {part.seller}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <section className="card">
          <p>No parts found for this search.</p>
          <Link className="button" href={`/request?part=${encodeURIComponent(query)}`}>
            Create part request
          </Link>
        </section>
      )}
      <Link className="link" href="/">
        Back to home
      </Link>
    </main>
  );
}
