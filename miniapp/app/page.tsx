'use client';
import useSWR from 'swr';

const backendBase = process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || '';
const marketsEndpoint = backendBase ? `${backendBase}/api/markets` : '/api/markets';
const tradeEndpoint = backendBase ? `${backendBase}/api/trade` : '/api/trade';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data } = useSWR(marketsEndpoint, fetcher);

  return (
    <div style={{padding:20}}>
      <h1>Prediction Markets</h1>
      {data?.markets?.map((m:any)=>(
        <div key={m.id} style={{border:'1px solid #ccc', padding:10, marginTop:10}}>
          <h3>{m.title}</h3>
          <p>YES: {m.yes}% | NO: {m.no}%</p>
          <button onClick={()=>trade(m.id,'YES')}>Buy YES</button>
          <button onClick={()=>trade(m.id,'NO')}>Buy NO</button>
        </div>
      ))}
    </div>
  );
}

async function trade(market_id:string, side:string){
  await fetch(tradeEndpoint,{
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({market_id, side, amount:10})
  });
  alert('Trade executed');
}
