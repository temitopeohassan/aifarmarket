import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    accountAssociation: {
      header:
        process.env.FARCASTER_HEADER ||
        'eyJmaWQiOjcwODcwNywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDQwMTJGRmQzQmE5ZTJiRjY3NDIzNTFEQzJDNDE1NWFDRjBEZjVhZWUifQ',
      payload:
        process.env.FARCASTER_PAYLOAD ||
        'eyJkb21haW4iOiJhaWZhcm1hcmtldC52ZXJjZWwuYXBwIn0',
      signature:
        process.env.FARCASTER_SIGNATURE ||
        'MHhiNzNhYWIzNDk0Zjg4ZTVmMDhhMjkwODk4MTMyNmI3MGZkNzhiMDUyYzZlODZmYmNlMzgwNjg4OTcyZmZhMmY1MmM1MWNhNDJmNmMyMTI2NTI4ZTdiOGM0YjU3YTBjNzk0Y2RmZTZiYTQ3ZTI2MTUxM2VjZjAyYWExMGNmZTI1NDFj',
    },
    frame: {
      version: '1',
      name: 'AI FarMarket',
      iconUrl: 'https://aifarmarket.vercel.app/icon.png',
      splashImageUrl: 'https://aifarmarket.vercel.app/splash.png',
      splashBackgroundColor: '#FFFFFF',
      homeUrl: 'https://aifarmarket.vercel.app',
      imageUrl: 'https://aifarmarket.vercel.app/image.png',
      buttonTitle: 'Launch',
      heroImageUrl:
        'https://aifarmarket.vercel.app/image.png',
      webhookUrl: 'https://aifarmarket.vercel.app/api/webhook',
      subtitle: 'AI Agents Trading on Prediction Markets',
      description: 'A platform for AI agents to trade on Polymarket with built-in performance tracking and strategy management',
      "screenshotUrls": [
      "https://aifarmarket.vercel.app/IMG_1781.jpg",
      "https://aifarmarket.vercel.app/IMG_1782.jpg",
      "https://aifarmarket.vercel.app/IMG_1780.jpg"
    ],
      primaryCategory: 'finance',
     tags: [
      "markets",
      "trade",
      "predictions",
      "agents"
    ],
      tagline: 'AI Agents Trading on Prediction Markets',
      ogTitle: 'AI FarMarket',
      ogDescription: 'A platform for AI agents to trade on Polymarket with built-in performance tracking and strategy management',
      ogImageUrl:
        'https://aifarmarket.vercel.app/og-image.png',
      castShareUrl: 'https://aifarmarket.vercel.app/',
    },
   "baseBuilder": {
    "allowedAddresses": ["0x14E85A3859B7532CB31E16EA66fB5F981B6dE1C0"]
    },
  };

  return NextResponse.json(config);
}

export const runtime = 'edge';
