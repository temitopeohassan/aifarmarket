export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const backendBase = process.env.BACKEND_API_BASE_URL;
  const body = await request.json();

  if (!backendBase) {
    return Response.json({ error: "Backend not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${backendBase}/api/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("Create-user API Error:", err);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
