import "dotenv/config";
import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

async function main() {
    const pk = process.env.POLYMARKET_PRIVATE_KEY;
    if (!pk) return;
    const wallet = new Wallet(pk);
    const client = new ClobClient("https://clob.polymarket.com", 137, wallet);
    
    console.log("Client methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
}

main();
