import { ClobClient } from "@polymarket/clob-client";
import { ethers, Wallet } from "ethers";

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
 * Approve Polymarket to spend USDC
 * Note: This is a one-time transaction required for new wallets
 */
export async function approveUSDC() {
    const privateKey = process.env.POLYMARKET_PRIVATE_KEY;
    if (!privateKey) throw new Error("Private key missing");

    const wallet = new Wallet(privateKey).connect(new ethers.providers.StaticJsonRpcProvider("https://polygon-bor-rpc.publicnode.com", 137));
    
    // Addresses for Polygon (Normalized with getAddress to fix checksum issues)
    const USDC_ADDRESS = ethers.utils.getAddress("0x2791bca1f2de4661ed88a30c99a7a9449aa84174"); // USDC.e
    const EXCHANGE_ADDRESS = ethers.utils.getAddress("0x4bfb97299e6e9d7f3630f5d6747a9d2209d843b2"); // Polymarket CLOB

    console.log(`Initiating USDC approval for Exchange: ${EXCHANGE_ADDRESS}...`);
    
    const erc20Abi = [
        "function approve(address spender, uint256 amount) public returns (bool)"
    ];
    
    const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, wallet);
    
    // Approve unlimited amount with explicit gas for Polygon
    // Polygon requires higher gas prices (min 30 Gwei) to avoid rejection
    const tx = await usdcContract.approve(
        EXCHANGE_ADDRESS, 
        ethers.constants.MaxUint256,
        {
            maxPriorityFeePerGas: ethers.utils.parseUnits("50", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("300", "gwei")
        }
    );
    return tx;
}


/**
 * Execute a trade on Polymarket
 */
export async function executePolymarketTrade({ marketId, side, amount, outcome, price }) {
    if (!clobClient) {
        throw new Error("Polymarket client not initialized");
    }

    const tokenId = await getMarketTokenId(marketId, outcome);

    // Convert USD amount to Shares (size)
    // Polymarket SDK expects size as number of shares
    const shares = Number(amount) / Number(price);

    console.log(`Executing trade: ${side} ${shares.toFixed(2)} shares of ${tokenId} @ $${price}`);

    const order = await clobClient.createOrder({
        tokenID: tokenId,
        price: Number(price), 
        side: side.toUpperCase(), // "BUY" or "SELL"
        size: Number(shares.toFixed(6)), // Polymarket usually allows up to 6 decimals
        feeRateBps: 0,
        nonce: 0
    });

    const response = await clobClient.postOrder(order);
    return response;
}
