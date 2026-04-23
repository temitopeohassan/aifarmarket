import "dotenv/config";
import { initPolymarketClient, approveUSDC } from "../services/polymarketService.js";

/**
 * Script to approve Polymarket to spend your USDC
 * Run with: node src/scripts/approve-usdc.js
 */
async function main() {
    console.log("\x1b[34mStarting Polymarket Allowance Approval...\x1b[0m");
    
    // 1. Initialize Client
    const client = await initPolymarketClient();
    if (!client) {
        console.error("\x1b[31mError: Polymarket client failed to initialize. Check your .env file.\x1b[0m");
        process.exit(1);
    }

    try {
        // 2. Execute Approval
        console.log("Checking and updating approval status...");
        const response = await approveUSDC();
        
        console.log("\n\x1b[32m--- Approval Transaction Sent ---\x1b[0m");
        console.log("Transaction Hash:", response.hash || response);
        console.log("\x1b[32m----------------------------------\x1b[0m\n");
        
        console.log("Success! Your wallet is now authorized to trade on the Polymarket CLOB.");
        console.log("Note: It may take a minute for the transaction to be confirmed on Polygon.");

    } catch (err) {
        console.error("\n\x1b[31m❌ Approval failed:\x1b[0m");
        console.error(err.message);
        
        if (err.message.includes("insufficient funds")) {
            console.log("\x1b[33mTip: You need a small amount of POL (Matic) in your wallet to pay for the gas fee.\x1b[0m");
        }
    }
}

main();
