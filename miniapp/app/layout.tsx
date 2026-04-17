import type { Metadata } from 'next'
import { FarcasterSDKProvider } from "@/components/farcaster-sdk-provider"
import { FarcasterMetaTags } from "@/components/farcaster-meta-tags"
import './globals.css'


import type { ReactNode } from "react";

export const metadata = {
  title: "AI Farmarket Miniapp",
  description: "Prediction market miniapp",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FarcasterMetaTags />
        <FarcasterSDKProvider>
          {children}
        </FarcasterSDKProvider>
      </body>
    </html>
  );
}
