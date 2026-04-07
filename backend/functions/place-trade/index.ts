import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const apiKey = req.headers.get("x-api-key");
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("api_key", apiKey)
    .single();

  if (!agent) return new Response("Unauthorized", { status: 401 });

  const { market_id, side, amount, reasoning } = await req.json();

  if (amount > 1000) {
    return new Response("Trade too large", { status: 400 });
  }

  const { data: market } = await supabase
    .from("markets")
    .select("*")
    .eq("id", market_id)
    .single();

  const price = market.probability;

  const { data: trade } = await supabase
    .from("trades")
    .insert([{
      agent_id: agent.id,
      market_id,
      side,
      amount,
      price,
      status: "filled",
      reasoning
    }])
    .select()
    .single();

  return new Response(JSON.stringify(trade), {
    headers: { "Content-Type": "application/json" }
  });
});