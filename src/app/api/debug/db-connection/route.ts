import { NextResponse } from 'next/server';

export async function GET() {
  const raw = process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? null;
  if (!raw) {
    return NextResponse.json({ error: 'No DATABASE_URL or DIRECT_URL present' }, { status: 500 });
  }

  try {
    const url = new URL(raw);
    const username = url.username;
    const host = url.hostname;
    const port = url.port;
    const pathname = url.pathname;
    const params: Record<string,string> = {};
    url.searchParams.forEach((v,k) => (params[k]=v));

    return NextResponse.json({
      username,
      host,
      port,
      pathname,
      searchParams: Object.keys(params),
      note: 'Password is hidden. Remove this endpoint after verification.'
    });
  } catch (err:any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
