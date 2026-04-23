import "dotenv/config";
import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

/**
 * Script to derive Polymarket L2 Credentials from a Private Key
 * Run with: node src/scripts/derive-credentials.js
 */
async function main() {
    const pk = process.env.POLYMARKET_PRIVATE_KEY;
    
    if (!pk || pk === "0x...") {
        console.error("\x1b[31mError: POLYMARKET_PRIVATE_KEY is not set in backend/.env\x1b[0m");
        console.log("Please add your private key to the .env file first.");
        process.exit(1);
    }

    try {
        const wallet = new Wallet(pk);
        // We use the Polygon chain (137)
        const client = new ClobClient("https://clob.polymarket.com", 137, wallet);

        console.log("\x1b[34mDeriving credentials for address:\x1b[0m", wallet.address);
        console.log("This involves signing a message with your wallet...");

        const creds = await client.createOrDeriveApiKey();
        
        if (!creds || !creds.apiKey) {
            console.log("\x1b[33mWarning: createOrDeriveApiKey returned empty results. Trying direct derivation...\x1b[0m");
            // Some SDK versions use different naming or require explicit derivation
            const derived = await client.deriveApiKey();
            if (derived) {
                console.log("\n\x1b[32m--- Polymarket L2 Credentials (Derived) ---\x1b[0m");
                console.log(`POLYMARKET_L2_API_KEY=${derived.apiKey || derived.key}`);
                console.log(`POLYMARKET_L2_API_SECRET=${derived.apiSecret || derived.secret}`);
                console.log(`POLYMARKET_L2_API_PASSPHRASE=${derived.apiPassphrase || derived.passphrase}`);
                console.log("\x1b[32m-------------------------------------------\x1b[0m\n");
                process.exit(0);
            }
        }

        console.log("\n\x1b[32m--- Polymarket L2 Credentials Successfully Derived ---\x1b[0m");
        console.log(`POLYMARKET_L2_API_KEY=${creds.apiKey}`);
        console.log(`POLYMARKET_L2_API_SECRET=${creds.apiSecret}`);
        console.log(`POLYMARKET_L2_API_PASSPHRASE=${creds.apiPassphrase}`);
        console.log("\x1b[32m------------------------------------------------------\x1b[0m\n");
        
        console.log("Step 1: Copy the 3 lines above.");
        console.log("Step 2: Paste them into your \x1b[1mbackend/.env\x1b[0m file.");
        console.log("Step 3: Restart your backend server.");

    } catch (err) {
        console.error("\n\x1b[31m❌ Derivation failed:\x1b[0m");
        console.error(err.message);
        if (err.message.includes("403")) {
            console.log("\nTip: Make sure this wallet has interacted with Polymarket before or has a small amount of POL for gas.");
        }
    }
}

main();
