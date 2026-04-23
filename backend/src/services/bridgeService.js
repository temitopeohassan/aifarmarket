import "dotenv/config";

/**
 * Uniswap Bridge Service (April 2026 Spec)
 * Bridges USDC from Base to Polygon with 5% platform commission
 */

const UNISWAP_API_BASE = "https://api.uniswap.org/v2";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_POLYGON = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"; // Native USDC

/**
 * Check if the user has approved Permit2 on the source chain
 */
export async function checkBridgeApproval(userAddress, amountInUnits, chainId = 8453, token = USDC_BASE) {
    const response = await fetch(`${UNISWAP_API_BASE}/check_approval`, {
        method: "POST",
        headers: { 
            "X-API-KEY": process.env.UNISWAP_API_KEY, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            walletAddress: userAddress,
            token: token,
            amount: amountInUnits,
            chainId: chainId
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Uniswap Approval Check failed: ${err.message || response.statusText}`);
    }

    const { approval } = await response.json();
    return approval; // Transaction object if approval needed, null otherwise
}

/**
 * Get a bridge quote with 5% commission
 */
export async function getBridgeQuote(userAddress, amountInUsdc, fromChainId = 8453, toChainId = 137) {
    const feeBips = (process.env.COMMISSION_PERCENT || 5) * 100;
    
    const tokenIn = fromChainId === 8453 ? USDC_BASE : USDC_POLYGON;
    const tokenOut = toChainId === 8453 ? USDC_BASE : USDC_POLYGON;

    const response = await fetch(`${UNISWAP_API_BASE}/quote`, {
        method: "POST",
        headers: { 
            "X-API-KEY": process.env.UNISWAP_API_KEY, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            tokenInChainId: fromChainId,
            tokenOutChainId: toChainId,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amount: (Number(amountInUsdc) * 10 ** 6).toString(),
            type: "EXACT_INPUT",
            intent: "BRIDGE",
            fee: {
                feeBips: feeBips.toString(),
                recipient: process.env.COMMISSION_RECIPIENT_ADDRESS
            }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Uniswap Quote failed: ${err.message || response.statusText}`);
    }

    return await response.json();
}

/**
 * Generate the bridge transaction data
 */
export async function createBridgeTransaction(quote, userAddress) {
    const response = await fetch(`${UNISWAP_API_BASE}/swap`, {
        method: "POST",
        headers: { 
            "X-API-KEY": process.env.UNISWAP_API_KEY, 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            quote: quote,
            recipient: userAddress,
            slippageTolerance: "0.5"
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Uniswap Swap generation failed: ${err.message || response.statusText}`);
    }

    const { transaction } = await response.json();
    return transaction;
}
