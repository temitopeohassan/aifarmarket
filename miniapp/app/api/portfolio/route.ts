export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const backendBase = process.env.BACKEND_API_BASE_URL;

  const fallback = {
    wallet: { balance: 0, available: 0 },
    positions: [],
    trades: [],
    performance: []
  };

  if (!backendBase) {
    return Response.json(fallback);
  }

  try {
    const res = await fetch(`${backendBase}/api/portfolio`, { cache: "no-store" });
    if (!res.ok) {
      return Response.json(fallback);
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Portfolio API Error:", err);
    return Response.json(fallback);
  }
}
