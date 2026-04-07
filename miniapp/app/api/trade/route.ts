export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  const backendBase = process.env.BACKEND_API_BASE_URL;
  if (!backendBase) {
    return Response.json(
      { error: "BACKEND_API_BASE_URL is not configured" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const apiKey = req.headers.get("x-api-key");

  const response = await fetch(`${backendBase}/api/trade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
