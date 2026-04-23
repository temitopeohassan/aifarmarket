import "dotenv/config";
import cors from "cors";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const app = express();

// --- Configuration ---
const port = Number(process.env.PORT || 8080);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const corsOptions = allowedOrigins.length
    ? { origin: allowedOrigins }
    : { origin: true };

// --- State & Connections ---
let supabase = null;

// Initialize Supabase
if (supabaseUrl && supabaseServiceRoleKey) {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
}

// Initialize Telegram Bot
import { initTelegramBot } from "./telegram.js";
initTelegramBot(supabase);

// Initialize Polymarket Client
import { initPolymarketClient } from "./services/polymarketService.js";
initPolymarketClient();

// --- Middleware ---
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

// --- Helper Functions ---
function generateApiKey() {
    return "ag_" + crypto.randomBytes(16).toString("hex");
}

// --- API Router ---
const api = express.Router();

// Health check
api.get(["/health", "/"], (req, res) => {
    const supabaseConfigured = !!supabase;
    res.status(supabaseConfigured ? 200 : 503).json({
        ok: supabaseConfigured,
        service: "aifarmarket-backend",
        supabaseConnected: supabaseConfigured
    });
});

// Check if user exists
api.get("/user-exists", async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: "address required" });
        if (!supabase) return res.status(500).json({ error: "Supabase not configured" }); 

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("address", String(address).toLowerCase())
            .maybeSingle();

        if (error) {
            console.error("Supabase user-exists error:", error);
            throw error;
        }
        return res.json({ exists: !!user, user });
    } catch (err) {
        console.error("Full error in user-exists:", err);
        return res.status(500).json({ error: err.message });
    }
});

// Create User
api.post("/create-user", async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

        const { address, fid, username, display_name, pfp_url } = req.body || {};

        if (!address) return res.status(400).json({ error: "address required" });

        // Check if user exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("address", address.toLowerCase())
            .maybeSingle();

        if (existingUser) return res.json(existingUser);

        // Create user with initial balance
        const { data: newUser, error } = await supabase
            .from("users")
            .insert([{ 
                address: address.toLowerCase(),
                fid: fid || null,
                username: username || null,
                display_name: display_name || null,
                pfp_url: pfp_url || null,
                balance: 10000,
                available: 10000,
                usdc_balance: 0
            }])
            .select("*")
            .single();

        if (error) {
            console.error("Supabase create-user error:", error);
            throw error;
        }
        return res.json(newUser);
    } catch (err) {
        console.error("Full error in create-user:", err);
        return res.status(500).json({ error: err.message });
    }
});

// Get Agents for user
api.get("/agents", async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: "address required" });
        if (!supabase) return res.status(500).json({ error: "Supabase not configured" }); 

        // 1. Get user
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("address", address.toLowerCase())
            .single();

        if (!user) return res.json({ agents: [] });

        // 2. Get agents
        const { data: agents, error: agentsError } = await supabase
            .from("agents")
            .select("*")
            .eq("user_id", user.id);

        if (agentsError) throw agentsError;

        // 3. Get performance for these agents
        const agentIds = agents.map(a => a.id);
        const { data: performanceData } = await supabase
            .from("performance")
            .select("*")
            .in("agent_id", agentIds);

        // 4. Merge
        const mergedAgents = agents.map(agent => {
            const perf = performanceData?.find(p => p.agent_id === agent.id) || {
                total_pnl: 0, roi: 0, win_rate: 0, sharpe_ratio: 0, trades_count: 0
            };
            return {
                ...agent,
                status: agent.is_active ? 'active' : 'stopped',
                performance: {
                    totalTrades: perf.trades_count,
                    winRate: perf.win_rate,
                    profitLoss: perf.total_pnl,
                    roi: perf.roi,
                    sharpeRatio: perf.sharpe_ratio,
                    maxDrawdown: 0 
                },
                configuration: { 
                    strategyType: agent.strategy || "Trend Following",
                    riskLevel: "medium",
                }
            };
        });

        return res.json({ agents: mergedAgents });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Portfolio Endpoint
api.get("/portfolio", async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: "address required" });
        if (!supabase) return res.status(500).json({ error: "Supabase not configured" }); 

        // 1. Get User and Balance
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("address", address.toLowerCase())
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Supabase portfolio error:", error);
            throw error;
        }

        if (!user) {
            return res.json({
                wallet: { balance: 0, available: 0, usdc_balance: 0 },
                positions: [],
                trades: [],
                performance: []
            });
        }

        // 3. Fetch related data (using user_id to catch both manual and agent trades)
        const [positionsRes, tradesRes, performanceRes] = await Promise.all([
            supabase.from("positions").select("*").eq("user_id", user.id),
            supabase.from("trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
            supabase.from("performance").select("*").in("agent_id", agents?.map(a => a.id) || [])
        ]);

        return res.json({
            wallet: { 
                balance: user.balance, 
                available: user.available,
                usdc_balance: user.usdc_balance || 0,
                address: user.address 
            },
            positions: (positionsRes.data || []).map(p => ({
                ...p,
                unrealizedPnL: Number(p.unrealized_pnl || 0)
            })),
            trades: tradesRes.data || [],
            performance: performanceRes.data || []
        });
    } catch (err) {
        console.error("Full error in portfolio:", err);
        return res.status(500).json({ error: err.message });
    }
});

import { executePolymarketTrade } from "./services/polymarketService.js";

// Trading Endpoint
api.post("/trade", async (req, res) => {
    try {
        const { market_id, side, amount, address, agent_id, outcome, price: requestedPrice } = req.body || {};
        
        if (!market_id || !side || !amount || !address) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

        // 1. Verify User and Balance
        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("address", address.toLowerCase())
            .single();

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.available < amount) return res.status(400).json({ error: "Insufficient available balance" });

        // 2. Verify Agent belongs to user (if agent_id provided)
        if (agent_id) {
            const { data: agent } = await supabase
                .from("agents")
                .select("*")
                .eq("id", agent_id)
                .eq("user_id", user.id)
                .single();

            if (!agent) return res.status(403).json({ error: "Agent not found or unauthorized" });
        }

        // 3. Execute Real Trade if possible, else use mock price
        let price = requestedPrice || 0.5;
        let externalTradeId = null;

        if (process.env.POLYMARKET_PRIVATE_KEY && outcome) {
            try {
                const polyResponse = await executePolymarketTrade({
                    marketId: market_id,
                    side: side,
                    amount: amount,
                    outcome: outcome,
                    price: price
                });
                externalTradeId = polyResponse.orderID;
                console.log(`Polymarket trade executed: ${externalTradeId}`);
            } catch (err) {
                console.error("Polymarket trade failed:", err.message);
                return res.status(502).json({ error: `Polymarket trade failed: ${err.message}` });
            }
        }

        // 4. Update balance and record trade
        const { error: tradeError } = await supabase
            .from("trades")
            .insert([{
                user_id: user.id,
                agent_id: agent_id || null,
                market_id,
                side: side.toUpperCase(),
                amount,
                price,
                status: "completed",
                reasoning: `Outcome: ${outcome || 'N/A'}. Entity: ${agent_id ? 'Agent' : 'User'}. External ID: ${externalTradeId || 'MOCKED'}`
            }]);

        if (tradeError) throw tradeError;

        const { error: userError } = await supabase
            .from("users")
            .update({ available: user.available - amount })
            .eq("id", user.id);

        if (userError) throw userError;

        // 5. Update Position
        const { data: existingPosition } = await supabase
            .from("positions")
            .select("*")
            .eq("user_id", user.id)
            .eq("agent_id", agent_id || null) // Distinguish positions by entity if needed, or unify?
            .eq("market_id", market_id)
            .maybeSingle();

        if (existingPosition) {
            await supabase
                .from("positions")
                .update({ size: Number(existingPosition.size) + amount })
                .eq("id", existingPosition.id);
        } else {
            await supabase
                .from("positions")
                .insert([{
                    user_id: user.id,
                    agent_id: agent_id || null,
                    market_id,
                    size: amount,
                    avg_price: price
                }]);
        }

        return res.json({ success: true, message: "Trade executed", tradeId: externalTradeId });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

import { registerAgent } from "./services/agentService.js";
import * as bridgeService from "./services/bridgeService.js";

// --- Bridge Endpoints ---

// Get Quote and Check Approval
api.get("/bridge/quote", async (req, res) => {
    try {
        const { address, amount, fromChainId, toChainId } = req.query;
        if (!address || !amount) return res.status(400).json({ error: "address and amount required" });

        const from = Number(fromChainId || 8453);
        const to = Number(toChainId || 137);
        const amountInUnits = (Number(amount) * 10 ** 6).toString();
        const token = from === 8453 ? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" : "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359";
        
        const [approval, quote] = await Promise.all([
            bridgeService.checkBridgeApproval(address, amountInUnits, from, token),
            bridgeService.getBridgeQuote(address, amount, from, to)
        ]);

        return res.json({ approval, quote });
    } catch (err) {
        console.error("Bridge quote error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// Prepare Bridge Transaction
api.post("/bridge/execute", async (req, res) => {
    try {
        const { address, quote } = req.body;
        if (!address || !quote) return res.status(400).json({ error: "address and quote required" });

        const transaction = await bridgeService.createBridgeTransaction(quote, address);
        return res.json({ transaction });
    } catch (err) {
        console.error("Bridge execute error:", err);
        return res.status(500).json({ error: err.message });
    }
});

// Register Agent
api.post("/agent/register", async (req, res) => {
    try {
        const agent = await registerAgent(supabase, req.body);
        return res.json({ success: true, agent });
    } catch (err) {
        const status = err.message.includes("not found") ? 404 : 500;
        return res.status(status).json({ error: err.message });
    }
});

api.get("/markets", async (_req, res) => {
    try {
        // Fetching Events instead of Markets to get latest high-profile questions
        const response = await fetch(
            "https://gamma-api.polymarket.com/events?active=true&closed=false&order=createdAt&ascending=false&limit=50"
        );

        if (!response.ok) {
            return res.status(502).json({ error: "Failed to fetch events from Polymarket" });
        }

        const events = await response.json();
        
        // Transform Events into a flat format compatible with your frontend
        const formattedMarkets = (Array.isArray(events) ? events : []).map((event) => {
            // We usually want the primary market associated with the event
            const primaryMarket = event.markets?.[0] || {};
            
            return {
                id: String(event.id),
                title: event.title,
                description: event.description || "",
                slug: event.slug,
                image: event.image,
                category: event.category?.name || "General",
                venue: "Polymarket",
                
                // Trading Essentials
                clobTokenId: primaryMarket.clobTokenId, // Vital for your execute_trade tool
                marketId: primaryMarket.id,
                
                // Pricing & Liquidity
                // Most events use [Yes, No] prices
                yes: Math.round(Number(primaryMarket.outcomePrices?.[0] ?? 0) * 100),
                no: Math.round(Number(primaryMarket.outcomePrices?.[1] ?? 0) * 100),
                liquidity: Number(event.liquidity || 0),
                
                // All associated markets for this event (for complex/multi-choice)
                subMarkets: event.markets.map(m => ({
                    id: m.id,
                    question: m.question,
                    clobTokenId: m.clobTokenId,
                    prices: m.outcomePrices
                })),
                
                endDate: event.endDate,
                createdAt: event.createdAt
            };
        });

        return res.json({ markets: formattedMarkets });

    } catch (err) {
        console.error("Polymarket Event Fetch Error:", err);
        return res.status(500).json({ error: "Unexpected error fetching prediction markets" });
    }
});

app.use("/api", api);

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running locally on port ${port}`);
    });
}

export default app;
