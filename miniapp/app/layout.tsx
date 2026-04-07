import type { ReactNode } from "react";

export const metadata = {
  title: "AI Farmarket Miniapp",
  description: "Prediction market miniapp",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
