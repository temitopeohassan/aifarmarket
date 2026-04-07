export async function GET() {
  const res = await fetch('https://gamma-api.polymarket.com/markets');
  const data = await res.json();

  return Response.json({
    markets: data.slice(0,10).map((m:any)=>({
      id: m.id,
      title: m.question,
      yes: Math.round(m.outcomePrices[0]*100),
      no: Math.round(m.outcomePrices[1]*100)
    }))
  });
}
