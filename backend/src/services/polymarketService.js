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
        // 1. Fetch market data from Gamma API
        const response = await fetch(`https://gamma-api.polymarket.com/markets/${marketId}`);
        if (!response.ok) throw new Error(`Failed to fetch market ${marketId} from Gamma`);

        const market = await response.json();

        // 2. Extract clobTokenIds
        // In 2026, Gamma sometimes returns these as a stringified array or a direct array
        let tokenIds = market.clobTokenIds;

        if (typeof tokenIds === 'string') {
            tokenIds = JSON.parse(tokenIds);
        }

        if (tokenIds && Array.isArray(tokenIds) && tokenIds.length >= 2) {
            // Standard Binary Market: [0] is YES, [1] is NO
            const index = outcome.toUpperCase() === 'YES' ? 0 : 1;
            const selectedToken = tokenIds[index];

            if (selectedToken) return selectedToken;
        }

        // 3. Fallback: If clobTokenIds is missing, check the parent event
        // Some new markets link IDs via the event's market array
        if (market.eventId) {
            const eventResponse = await fetch(`https://gamma-api.polymarket.com/events/${market.eventId}`);
            if (eventResponse.ok) {
                const event = await eventResponse.json();
                const nestedMarket = event.markets?.find(m => String(m.id) === String(marketId));

                if (nestedMarket?.clobTokenId) {
                    // Note: If the event lookup only provides one ID, it's usually the 'YES' side 
                    // or a specific outcome in a multi-choice set.
                    return nestedMarket.clobTokenId;
                }
            }
        }

        throw new Error(`CLOB Token ID not found for market: ${marketId} outcome: ${outcome}`);
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
