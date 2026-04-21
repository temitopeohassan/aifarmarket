import "dotenv/config";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { Wallet } from "ethers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import serverless from "serverless-http";


const app = express();
const port = Number(process.env.PORT || 8080);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const allowUnauthenticatedTrades = process.env.ALLOW_UNAUTHENTICATED_TRADES === "true";
const defaultAgentId = process.env.DEFAULT_AGENT_ID || null;

const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const corsOptions = allowedOrigins.length
    ? { origin: allowedOrigins }
    : { origin: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

let supabase = null;
if (supabaseUrl && supabaseServiceRoleKey) {
    supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
}

import admin from "firebase-admin";

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON
);

// Fix private key formatting
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();



function generateApiKey() {
    return "ag_" + crypto.randomBytes(16).toString("hex");
}

app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        service: "aifarmarket-backend",
        supabaseConfigured: Boolean(supabase),
    });
});

app.get("/api/agents", async (_req, res) => {
    try {
        if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
        const { data, error } = await supabase.from("agents").select("*");
        if (error) throw error;
        return res.json({ agents: data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get("/api/portfolio", async (req, res) => {
    try {
        if (!supabase) return res.status(500).json({ error: "Supabase not configured" });

        // In a real app, you'd filter by user/owner.
        const { data: positions, error: pError } = await supabase.from("positions").select("*");
        const { data: trades, error: tError } = await supabase.from("trades").select("*").order("created_at", { ascending: false }).limit(20);
        const { data: performance, error: perfError } = await supabase.from("performance").select("*");

        if (pError || tError || perfError) throw pError || tError || perfError;

        return res.json({
            wallet: { balance: 10000, available: 8500 }, // Mocked wallet for now
            positions,
            trades,
            performance
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get("/api/markets", async (_req, res) => {
    try {
        // Fetch all active markets with pricing data
        const r = await fetch("https://gamma-api.polymarket.com/markets?limit=100&active=true");
        if (!r.ok) {
            return res.status(502).json({ error: "Failed to fetch markets" });
        }

        const data = await r.json();

        // Sort by last_traded_at (or fallback to created_at) descending
        const markets = (Array.isArray(data) ? data : [])
            .sort((a, b) => {
                const timeA = new Date(a.last_traded_at || a.created_at || 0).getTime();
                const timeB = new Date(b.last_traded_at || b.created_at || 0).getTime();
                return timeB - timeA;
            })
            .map((m) => ({
                id: String(m.id),
                title: m.question ?? m.title ?? "",
                yes: Math.round(Number(m?.outcomePrices?.[0] ?? 0) * 100),
                no: Math.round(Number(m?.outcomePrices?.[1] ?? 0) * 100),
                lastTraded: m.last_traded_at,
                raw: m,
            }));

        return res.json({ markets });
    } catch (_err) {
        return res.status(500).json({ error: "Unexpected market fetch error" });
    }
});

app.post("/api/trade", async (req, res) => {
    try {
        const { market_id, side, amount, reasoning } = req.body || {};
        if (!market_id || !side || typeof amount !== "number") {
            return res.status(400).json({ error: "market_id, side, and amount are required" });
        }
        if (!["YES", "NO"].includes(String(side).toUpperCase())) {
            return res.status(400).json({ error: "side must be YES or NO" });
        }
        if (amount <= 0) {
            return res.status(400).json({ error: "amount must be > 0" });
        }
        if (amount > 1000) {
            return res.status(400).json({ error: "Trade too large" });
        }
        if (!supabase) {
            return res.status(500).json({ error: "Supabase is not configured" });
        }

        let agentId = defaultAgentId;
        const apiKey = req.header("x-api-key");
        if (apiKey) {
            const { data: agent } = await supabase
                .from("agents")
                .select("id")
                .eq("api_key", apiKey)
                .single();
            if (!agent) return res.status(401).json({ error: "Unauthorized" });
            agentId = agent.id;
        } else if (!allowUnauthenticatedTrades) {
            return res.status(401).json({ error: "Missing x-api-key" });
        }

        if (!agentId) {
            return res.status(400).json({ error: "No agent available for trade" });
        }

        const { data: market } = await supabase
            .from("markets")
            .select("id, probability")
            .eq("id", market_id)
            .single();

        const price = market?.probability ?? 0.5;
        const { data: trade, error } = await supabase
            .from("trades")
            .insert([
                {
                    agent_id: agentId,
                    market_id,
                    side: String(side).toUpperCase(),
                    amount,
                    price,
                    status: "filled",
                    reasoning: reasoning ?? null,
                },
            ])
            .select("*")
            .single();

        if (error) {
            return res.status(500).json({ error: "Trade insert failed", details: error.message });
        }

        return res.json({ success: true, trade });
    } catch (_err) {
        return res.status(500).json({ error: "Unexpected trade execution error" });
    }
});

app.post("/api/mcp", async (req, res) => {
    const { tool, input } = req.body || {};
    if (!tool) return res.status(400).json({ error: "tool is required" });

    if (tool === "get_markets") {
        const response = await fetch(
            `${req.protocol}://${req.get("host")}/api/markets`,
            { method: "GET" },
        );
        const data = await response.json();
        return res.json(data);
    }

    if (tool === "execute_trade") {
        const response = await fetch(
            `${req.protocol}://${req.get("host")}/api/trade`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": req.header("x-api-key") || "" },
                body: JSON.stringify(input || {}),
            },
        );
        const data = await response.json();
        return res.status(response.status).json(data);
    }

    return res.status(400).json({ error: "Unknown tool" });
});

app.post("/api/account/create", async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({ error: "Supabase not configured" });
        }

        const { wallet_address, signature, message } = req.body || {};

        if (!wallet_address || !signature || !message) {
            return res.status(400).json({ error: "wallet_address, signature, message required" });
        }

        // 🔐 1. Verify signature
        let recovered;
        try {
            recovered = verifyMessage(message, signature);
        } catch {
            return res.status(400).json({ error: "Invalid signature" });
        }

        if (recovered.toLowerCase() !== wallet_address.toLowerCase()) {
            return res.status(401).json({ error: "Signature does not match wallet" });
        }

        // 2. Check if user exists
        let { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("wallet_address", wallet_address)
            .maybeSingle();

        // 3. Create user if not exists
        if (!user) {
            const { data: newUser, error } = await supabase
                .from("users")
                .insert([{ wallet_address }])
                .select("*")
                .single();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            user = newUser;
        }

        // 4. Check if trading wallet exists
        const { data: existingWallet } = await supabase
            .from("trading_wallets")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (existingWallet) {
            return res.json({
                success: true,
                user,
                trading_wallet: {
                    address: existingWallet.address,
                    balance: existingWallet.balance,
                },
                message: "Account already exists",
            });
        }

        // 5. Create custodial trading wallet
        const wallet = Wallet.createRandom();

        const { data: tradingWallet, error: walletError } = await supabase
            .from("trading_wallets")
            .insert([
                {
                    user_id: user.id,
                    address: wallet.address,
                    private_key: wallet.privateKey, // ⚠️ encrypt later
                    balance: 10000,
                },
            ])
            .select("*")
            .single();

        if (walletError) {
            return res.status(500).json({ error: walletError.message });
        }

        return res.json({
            success: true,
            user,
            trading_wallet: {
                address: tradingWallet.address,
                balance: tradingWallet.balance,
            },
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post("/api/agent/register", async (req, res) => {
    try {
        const { wallet_address, signature, message, name, description } = req.body || {};

        if (!wallet_address || !signature || !message || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 🔐 Verify wallet
        const recovered = verifyMessage(message, signature);
        if (recovered.toLowerCase() !== wallet_address.toLowerCase()) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // 1. Get user
        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("wallet_address", wallet_address)
            .single();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Create agent
        const apiKey = generateApiKey();

        const { data: agent, error } = await supabase
            .from("agents")
            .insert([
                {
                    user_id: user.id,
                    name,
                    description: description || "",
                    api_key: apiKey,
                },
            ])
            .select("*")
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // 3. Create agent wallet
        const wallet = Wallet.createRandom();

        await firestore.collection("agent_wallets").doc(agent.id).set({
            agentId: agent.id,
            address: wallet.address,
            privateKey: wallet.privateKey, // ⚠️ encrypt later
            balance: 10000,
            createdAt: new Date().toISOString(),
        });

        return res.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                api_key: apiKey,
            },
            wallet: {
                address: wallet.address,
                balance: 10000,
            },
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default serverless(app);