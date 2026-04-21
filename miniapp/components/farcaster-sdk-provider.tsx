"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

// Dynamically get the type from the SDK
type ContextType = Awaited<typeof sdk.context>;

interface FarcasterContextType {
  address: string | null;
  fcUsername: string | null;
}

const WalletContext = createContext<FarcasterContextType>({
  address: null,
  fcUsername: null
});

export function FarcasterSDKProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [fcUsername, setFcUsername] = useState<string | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        // cast to the dynamic type
        const context = (await sdk.context) as ContextType;

        if (context?.user?.username) {
          setFcUsername(context.user.username);
        }

        await sdk.actions.ready();

        const provider = await sdk.wallet.getEthereumProvider();
        const accounts = (await provider.request({
          method: "eth_requestAccounts"
        })) as string[];

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Farcaster SDK Initialization error:", error);
      }
    };

    initSDK();
  }, []);

  return (
    <WalletContext.Provider value={{ address, fcUsername }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useFarcasterWallet = () => useContext(WalletContext);