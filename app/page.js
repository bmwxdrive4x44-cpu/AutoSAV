import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <p className="muted">Role: Client</p>
        <h1>AutoSAV</h1>
        <p>Find car parts fast across Algeria.</p>
        <form action="/results" className="stack">
          <input
            aria-label="Search car parts"
            className="input"
            name="q"
            placeholder="Search: Clio bumper, Golf alternator..."
            required
          />
          <button className="button" type="submit">
            Search parts
          </button>
        </form>
        <Link className="link" href="/request">
          Need a part? Create a request
        </Link>
      </section>
      <section className="card">
        <p className="muted">Role: Seller</p>
        <h2>Seller space</h2>
        <Link className="button secondary" href="/seller">
          Open seller dashboard
        </Link>
      </section>
    </main>
  );
}
