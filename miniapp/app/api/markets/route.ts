export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const backendBase = process.env.BACKEND_API_BASE_URL;

  // In production, route through backend API. Local dev can fallback directly.
  if (backendBase) {
    const res = await fetch(`${backendBase}/api/markets`, { cache: "no-store" });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  }

  const res = await fetch("https://gamma-api.polymarket.com/markets", { cache: "no-store" });
  const data = await res.json();

  return Response.json({
    markets: data.slice(0, 10).map((m: any) => ({
      id: m.id,
      title: m.question,
      yes: Math.round(m.outcomePrices[0] * 100),
      no: Math.round(m.outcomePrices[1] * 100),
    })),
  });
}
