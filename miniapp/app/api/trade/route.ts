export async function POST(req: Request){
  const body = await req.json();

  // TODO: integrate real smart contract / Polymarket execution
  console.log('Executing trade', body);

  return Response.json({success:true});
}
