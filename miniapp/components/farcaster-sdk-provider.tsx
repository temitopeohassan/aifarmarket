"use client"

import { useEffect } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

export function FarcasterSDKProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the SDK and call ready() to hide the splash screen
    const initSDK = async () => {
      try {
        await sdk.actions.ready()
        console.log("Farcaster SDK initialized successfully")
      } catch (error) {
        console.error("Failed to initialize Farcaster SDK:", error)
      }
    }

    initSDK()
  }, [])

  return <>{children}</>
}
