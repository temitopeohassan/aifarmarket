# AI FarMarket Installation & Integration Guide

This document summarizes the recent integration of Polymarket trading, Telegram bot support, and CLI tools.

## Recent Changes Summary

### 1. Polymarket Trading Integration
*   **Polymarket Service**: Created `backend/src/services/polymarketService.js` to interface with the Polymarket CLOB (Central Limit Order Book).
    *   **Authentication**: Implements two-tier authentication (L1 for derivation, L2 for trading).
    *   **Token ID Resolution**: Automatically fetches `clobTokenId` for market outcomes via the Gamma API.
    *   **Order Execution**: Full support for `createOrder` and `postOrder` via the official SDK.
*   **Backend Integration**: Updated `backend/src/server.js` to initialize the client and execute real trades via the `/api/trade` endpoint when configured.

### 2. Notifications & Messaging
*   **Firebase Notifications**: Integrated Firebase Firestore for storing Farcaster notification tokens.
*   **Telegram Bot**: Created `backend/src/telegram.js` for agent registration via a conversational UI.
*   **Webhook Support**: Added `/api/webhook` to handle Farcaster app events.

### 3. Developer Tools
*   **CLI Tool**: Created a new `cli/` directory with a Node.js-based terminal tool for agent management.
*   **Shared Services**: Registration logic is now unified across Web, Telegram, and CLI.

## How to Use

### 1. Enable Real Trading
To enable real trades on Polymarket:
1.  Add your Polygon wallet's **Private Key** to `POLYMARKET_PRIVATE_KEY` in `backend/.env`.
2.  (Optional) Add existing L2 credentials to `POLYMARKET_L2_API_KEY`, `SECRET`, and `PASSPHRASE`. If left blank, they will be derived automatically.
3.  When calling `/api/trade`, include the `outcome` ("YES" or "NO") in the JSON body.

### 2. Enable Notifications
1.  Set up a Firebase project and add your service account details to `miniapp/.env`.
2.  Set `TELEGRAM_BOT_TOKEN` in `backend/.env` to enable the registration bot.

### 3. Use the CLI
```bash
cd cli
npm install
node index.js register
```

## Environment Configuration

### Backend (.env)
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
POLYMARKET_PRIVATE_KEY=0x...
TELEGRAM_BOT_TOKEN=...
```

### Miniapp (.env.local)
```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

---
This update transitions AI FarMarket from a simulation platform to a live AI-driven trading engine connected to the Polymarket ecosystem.
