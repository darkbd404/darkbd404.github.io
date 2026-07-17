# IP-to-IP Voice Calling System

A production-ready WebRTC voice calling system with Node.js backend and vanilla JS frontend.

## Features
- One-to-one Voice Calling
- WebRTC Signaling via Socket.IO
- JWT Authentication
- Call History & Contacts
- PWA Support (Installable)
- Dark Mode UI

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)

## Installation

### 1. Clone the repository
git clone <your-repo-url>
cd ip-calling-system

### 2. Setup Backend
cd server
npm install
# Create .env file and add your variables (MONGO_URI, JWT_SECRET, etc.)
npm start

### 3. Setup Frontend
cd ../client
npm install
npm run dev

## Deployment to Render

### Backend (server/)
1. Create a new Web Service on Render.
2. Connect your GitHub repo.
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables from `.env` file.

### Frontend (client/)
1. Build the project locally: `npm run build`
2. Upload the `dist` folder to GitHub Pages, Netlify, or Vercel.
3. Update `API_URL` in `src/api.js` and `SOCKET_URL` in `src/webrtc.js` with your Render backend URL.

## WebRTC Flow
1. User A sends an Offer via Socket.IO.
2. User B receives the Offer and sends an Answer.
3. ICE Candidates are exchanged for NAT traversal.
4. Media stream is established directly between peers.
