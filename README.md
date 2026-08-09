# V-TACS (Venom Treatment & Ambulance Coordination System)

V-TACS is a real-time snakebite emergency logistics and triage coordination system digitizing the National Action Plan for Prevention and Control of Snakebite Envenoming in India (NAPSE).

## Key Features
- **Real-Time ASV Stock Auditing & Ventilator Matching**: Prevents rural antivenom stockouts by routing victims strictly to equipped facilities.
- **Dual Routing Matrix Engine**: Primary high-performance distance and ETA calculation via OSRM (Contraction Hierarchies) with automatic fallback to Haversine direct-line calculations on network disruption.
- **Conversational Voice Triage Module**: Hands-free voice intake powered by native browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) combined with Gemini LLM for intent extraction.
- **Deterministic Safety Guarantee**: Voice parsing auto-fills dashboard fields only; hospital reservation and ambulance dispatch require explicit manual button authorization.
- **Classic Windows Utility Aesthetic**: Single-page dense grid layout with 0px border radius, high-contrast rectangular panes, zero animations, and maximum data density.

## System Architecture & Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js + Express.js
- **Database**: MySQL (Aiven Cloud supported with SSL enforcement)
- **Routing Engine**: OSRM API + Haversine Fallback Engine
- **AI Triage**: Google Gemini LLM (`@google/generative-ai`)

## Quick Start
```bash
# Server Setup
cd server
npm install
npm start

# Client Setup
cd client
npm install
npm run dev
```
