export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const backendBase = process.env.BACKEND_API_BASE_URL;

  if (!backendBase || !address) {
    return Response.json({ exists: false });
  }

  try {
    const res = await fetch(`${backendBase}/api/user-exists?address=${address}`, { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ exists: false });
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("User-exists API Error:", err);
    return Response.json({ exists: false });
  }
}
