/**
 * Central API base URL.
 *
 * - Vercel (production): VITE_API_URL is not set → uses '' (same origin, /api/...)
 * - Local development:   VITE_API_URL=http://localhost:4000 (set in .env.local)
 *
 * This means on Vercel, fetch('/api/weather/Mumbai') hits the same domain.
 * In local dev, fetch('http://localhost:4000/api/weather/Mumbai') hits the backend.
 */
const API = import.meta.env.VITE_API_URL ?? '';

export default API;
