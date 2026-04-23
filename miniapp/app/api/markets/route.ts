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

  // 2026 Updated Market Discovery Logic
const res = await fetch(
  "https://gamma-api.polymarket.com/events?active=true&closed=false&order=createdAt&ascending=false&limit=100", 
  { 
    cache: "no-store",
    headers: {
      "Accept": "application/json",
      "X-aifarmarkets-Request-ID": crypto.randomUUID() // Recommended for audit/logging in your MCP
    }
  }
);

if (!res.ok) {
    throw new Error(`Gamma API Error: ${res.status} ${res.statusText}`);
}

const events = await res.json();

// Flattening events into a tradeable market list for your OracleX Agent
const tradeableMarkets = events.flatMap(event => {
    return (event.markets || []).map(market => ({
        eventId: event.id,
        marketId: market.id,
        slug: event.slug, // Vital for frontend deep-linking
        question: market.question || event.title,
        clobTokenId: market.clobTokenId, // THE most important field for execution
        
        // Price data normalized for 2026 (pUSD / CTF V2)
        prices: market.outcomePrices, // ["0.65", "0.35"]
        liquidity: Number(event.liquidity || 0),
        volume24h: Number(event.volume24hr || 0),
        
        category: event.category?.name || "General",
        endDate: event.endDate
    }));
});  const data = await res.json();

  return Response.json({
    markets: data.slice(0, 10).map((m: any) => ({
      id: m.id,
      title: m.question,
      yes: Math.round(m.outcomePrices[0] * 100),
      no: Math.round(m.outcomePrices[1] * 100),
    })),
  });
}
