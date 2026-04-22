import crypto from "crypto";

function generateApiKey() {
    return "ag_" + crypto.randomBytes(16).toString("hex");
}

export async function registerAgent(supabase, { address, name, description, strategy }) {
    if (!address || !name) {
        throw new Error("address and name required");
    }

    if (!supabase) {
        throw new Error("Supabase not configured");
    }

    // 1. Get user
    const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("address", address.toLowerCase())
        .single();

    if (!user) {
        throw new Error("User not found. Please create an account in the miniapp first.");
    }

    // 2. Generate API Key
    const apiKey = generateApiKey();

    // 3. Insert Agent
    const { data: agent, error } = await supabase
        .from("agents")
        .insert([{
            user_id: user.id,
            name,
            description: description || "",
            strategy: strategy || "Trend Following",
            api_key: apiKey,
            is_active: true
        }])
        .select("*")
        .single();

    if (error) throw error;

    // 4. Initialize performance record
    await supabase.from("performance").insert([{ agent_id: agent.id }]);

    return agent;
}
