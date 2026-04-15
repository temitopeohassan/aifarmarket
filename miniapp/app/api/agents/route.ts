export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const backendBase = process.env.BACKEND_API_BASE_URL;

  if (!backendBase) {
    return Response.json({ agents: [] });
  }

  try {
    const res = await fetch(`${backendBase}/api/agents`, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ agents: [] });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Agents API Error:", err);
    return Response.json({ agents: [] });
  }
}
