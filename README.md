# 🗺️ BharatDarshan — Discover Incredible India

> A premium, cinematic travel platform with Apple TV-inspired dark UI featuring real-time weather, AI-powered trip planning, and geolocation-based heritage discovery.

![BharatDarshan](https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg)

## ✨ Features

- 🌏 **30+ Indian States** — real photos, weather, places, news, and business data
- 🤖 **AI Trip Planner** — 3 personalized itinerary options with day-by-day breakdown
- 🏨 **Hotel Finder** — real hotels via OpenStreetMap with estimated prices
- 📍 **Live Heritage Radar** — GPS-based discovery of nearby monuments
- 🗺️ **Interactive Map** — dark Carto base map with historic site markers
- 🌤️ **Real-Time Weather** — Open-Meteo API (no key required)
- 📰 **State News** — GNews API with live India headlines
- 🔐 **Auth System** — JWT-based signup/login

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Apple TV dark aesthetic) |
| Maps | Leaflet.js + OpenStreetMap/CARTO |
| Backend | Node.js + Express |
| Database | SQLite (via sqlite3) |
| Auth | JWT + bcrypt |
| APIs | Open-Meteo, GNews, OpenStreetMap Overpass, Wikipedia REST |

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/bharatdarshan.git
cd bharatdarshan
```

### 2. Start the Backend
```bash
cd backend
cp .env.example .env          # fill in your GNEWS_API_KEY
npm install
node server.js
# → API running at http://localhost:4000
```

### 3. Start the Frontend
```bash
cd frontend
cp .env.example .env.local    # VITE_API_URL=http://localhost:4000
npm install
npm run dev
# → App running at http://localhost:5173
```

## 🌐 Deployment

### Backend → Render.com (Free)
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect this GitHub repo → select the **`backend/`** root directory
3. Build: `npm install` | Start: `node server.js`
4. Add environment variables:
   - `GNEWS_API_KEY` = your key
   - `JWT_SECRET` = any long random string
   - `NODE_ENV` = `production`
5. Copy your Render URL (e.g. `https://bharatdarshan-api.onrender.com`)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import this GitHub repo → set **Root Directory** to `frontend/`
3. Framework: **Vite** (auto-detected)
4. Add Environment Variable in Vercel dashboard:
   - `VITE_API_URL` = your Render backend URL from above
5. Deploy → done! 🎉

## 📝 Environment Variables

### Backend (set in Render dashboard)
| Variable | Description |
|----------|-------------|
| `GNEWS_API_KEY` | [gnews.io](https://gnews.io) API key |
| `JWT_SECRET` | Secret for signing JWTs |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGIN` | Your Vercel frontend URL |

### Frontend (set in Vercel dashboard)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL |

## 📜 License
MIT — built with ❤️ for Incredible India 🇮🇳
