import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { tool, input } = await req.json();

  switch (tool) {
    case "get_markets":
      const res = await fetch("https://api.polymarket.com/markets");
      return new Response(await res.text());

    default:
      return new Response("Unknown tool", { status: 400 });
  }
});