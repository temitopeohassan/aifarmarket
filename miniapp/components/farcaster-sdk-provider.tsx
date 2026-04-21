"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

type ContextType = Awaited<typeof sdk.context>;

interface FarcasterContextType {
  address: string | null;
  fcUsername: string | null;
  isAdded: boolean;
}

const WalletContext = createContext<FarcasterContextType>({
  address: null,
  fcUsername: null,
  isAdded: true
});

export function FarcasterSDKProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [fcUsername, setFcUsername] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState<boolean>(true);

  useEffect(() => {
    const initSDK = async () => {
      try {
        const context = (await sdk.context) as ContextType;

        // 1. Check if app is added
        const appIsAdded = !!context?.client?.added;
        setIsAdded(appIsAdded);

        if (context?.user?.username) {
          setFcUsername(context.user.username);
        }

        // 2. Hide splash screen
        await sdk.actions.ready();

        // 3. INVOKE ADD PROMPT AUTOMATICALLY
        // We only call this if isAdded is false
        if (!appIsAdded) {
          try {
            // This triggers the native Warpcast/Client prompt
            await sdk.actions.addMiniApp();
          } catch (e) {
            console.error("User dismissed or client blocked auto-add prompt", e);
          }
        }

        // 4. Initialize Wallet
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
    <WalletContext.Provider value={{ address, fcUsername, isAdded }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useFarcasterWallet = () => useContext(WalletContext);