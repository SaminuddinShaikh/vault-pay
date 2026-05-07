# Vault pay Payment Gateway UI

Payment gateway UI built with Next.js 15 (App Router), TypeScript, Redux Toolkit, and Tailwind CSS. No third-party payment SDK used gateway behaviour is simulated via a Next.js Route Handler.

## Setup

npm install
npm run dev


Open http://localhost:3000,  http://localhost:3000.

## Stack

Next.js 15 — App Router, Route Handlers
TypeScript — strict mode, no any
Redux Toolkit — global payment state
Tailwind CSS — styling
Radix UI — accessible primitives dialog, select, label boiler plate code of mine sor setup and layout also
lucide-react — icons


## How the gateway simulation works

POST /api/pay returns one of three outcomes, randomised server-side:

Outcome Probability

Success prox 60%
Failed approx 25% 
Timeout approx 15% 

The frontend cancels the request after 6 seconds using AbortController and shows a timeout state.

## Assumptions

Card validation uses the Luhn algorithm same as real card networks.
Transaction IDs are generated with crypto.randomUUID() before the first attempt and reused on retries, so history stays deduplicated.
History is capped at 50 entries in localStorage.
Dark theme only no light mode toggle needed for a demo.
Currency limited to INR and USD as specified.


## What I'd improve given more time

Add Playwright e2e tests covering the full lifecycle idle → processing → success/failed/timeout → retry
Add unit tests for all validators and the Luhn check
Rate limiting on /api/pay with IP-based throttling
A proper toast system for non-blocking feedback instead of relying only on the status screen
Skeleton loaders for the history panel on first paint
Animate the card flip to show CVV on the back face
HMAC request signing between client and the route handler
Error boundary around TransactionHistory so a corrupted localStorage entry doesn't crash the page