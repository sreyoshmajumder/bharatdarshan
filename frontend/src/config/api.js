/**
 * Central API base URL.
 * In development: http://localhost:4000
 * In production: set VITE_API_URL in Vercel environment variables
 *                pointing to your Render backend URL.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default API;
