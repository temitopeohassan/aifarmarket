import { serve } from "https://deno.land/std/http/server.ts";

serve(async () => {
  const res = await fetch("https://api.polymarket.com/markets");
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});