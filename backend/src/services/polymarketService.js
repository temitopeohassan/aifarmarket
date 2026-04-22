import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

let clobClient = null;

/**
 * Initialize the Polymarket CLOB client
 */
export async function initPolymarketClient() {
    const privateKey = process.env.POLYMARKET_PRIVATE_KEY;
    if (!privateKey) {
        console.log("POLYMARKET_PRIVATE_KEY not found, Polymarket trading disabled.");
        return null;
    }

    try {
        const wallet = new Wallet(privateKey);
        
        // Host: https://clob.polymarket.com
        // Chain ID: 137 (Polygon)
        clobClient = new ClobClient(
            process.env.POLYMARKET_CLOB_API_URL || "https://clob.polymarket.com",
            137,
            wallet,
            process.env.POLYMARKET_L2_API_KEY,
            process.env.POLYMARKET_L2_API_SECRET,
            process.env.POLYMARKET_L2_API_PASSPHRASE
        );

        console.log("Polymarket CLOB Client initialized.");
        
        // If L2 creds are missing, we might need to derive them once
        if (!process.env.POLYMARKET_L2_API_KEY) {
            console.log("Tip: Use client.createOrDeriveApiKey() to get your L2 credentials if you don't have them.");
        }

        return clobClient;
    } catch (error) {
        console.error("Failed to initialize Polymarket client:", error);
        return null;
    }
}

/**
 * Get market details including token IDs from Gamma API or CLOB
 */
export async function getMarketTokenId(marketId, outcome) {
    try {
        // First try to get from Gamma API (most markets have clobTokenIds there)
        const response = await fetch(`https://gamma-api.polymarket.com/markets/${marketId}`);
        if (!response.ok) throw new Error("Failed to fetch market data from Gamma");
        
        const market = await response.json();
        
        // Polymarket markets have clobTokenIds array: [YesTokenId, NoTokenId]
        if (market.clobTokenIds && Array.isArray(market.clobTokenIds)) {
            return outcome.toUpperCase() === 'YES' ? market.clobTokenIds[0] : market.clobTokenIds[1];
        }
        
        throw new Error("CLOB Token ID not found for this market");
    } catch (error) {
        console.error("Error fetching token ID:", error);
        throw error;
    }
}

/**
 * Execute a trade on Polymarket
 */
export async function executePolymarketTrade({ marketId, side, amount, outcome, price }) {
    if (!clobClient) {
        throw new Error("Polymarket client not initialized");
    }

    const tokenId = await getMarketTokenId(marketId, outcome);

    // Create the order
    // Note: side in SDK is "BUY" or "SELL". 
    // In Polymarket, "BUYING YES" is BUY with YesTokenId.
    const order = await clobClient.createOrder({
        tokenID: tokenId,
        price: price, // e.g. 0.65
        side: side.toUpperCase(), // "BUY" or "SELL"
        size: amount, // Number of shares
        feeRateBps: 0,
        nonce: 0
    });

    const response = await clobClient.postOrder(order);
    return response;
}
