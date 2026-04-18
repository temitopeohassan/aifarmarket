"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

// Create a small context to share the address
const WalletContext = createContext<{ address: string | null }>({ address: null });

export function FarcasterSDKProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        // 1. Signal that the app is ready
        await sdk.actions.ready();

        // 2. Get the Ethereum provider and request accounts automatically
        const provider = await sdk.wallet.getEthereumProvider();
        const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }

        console.log("Farcaster SDK and Wallet initialized");
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initSDK();
  }, []);

  return (
    <WalletContext.Provider value={{ address }}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use the wallet address elsewhere
export const useFarcasterWallet = () => useContext(WalletContext);