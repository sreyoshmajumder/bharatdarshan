const express = require('express');
const router = express.Router();

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const WX_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Icy Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy Drizzle', icon: '🌧️' },
  61: { label: 'Light Rain', icon: '🌧️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Light Snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  77: { label: 'Snow Grains', icon: '❄️' },
  80: { label: 'Light Showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  85: { label: 'Snow Showers', icon: '🌨️' },
  86: { label: 'Heavy Snow Showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Hail Storm', icon: '⛈️' },
  99: { label: 'Violent Thunderstorm', icon: '⛈️' },
};

function getCondition(code) {
  if (WX_CODES[code]) return WX_CODES[code];
  if (code <= 3)  return { label: 'Partly Cloudy', icon: '⛅' };
  if (code <= 48) return { label: 'Foggy', icon: '🌫️' };
  if (code <= 67) return { label: 'Rainy', icon: '🌧️' };
  if (code <= 77) return { label: 'Snowy', icon: '❄️' };
  if (code <= 82) return { label: 'Showers', icon: '🌦️' };
  return { label: 'Stormy', icon: '⛈️' };
}

router.get('/:city', async (req, res) => {
  const city = decodeURIComponent(req.params.city);
  const key  = city.toLowerCase();

  if (cache.has(key)) {
    const { data, ts } = cache.get(key);
    if (Date.now() - ts < CACHE_TTL) return res.json({ ...data, cached: true });
  }

  try {
    // Open-Meteo geocoding (no API key needed)
    const geoRes  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results?.length) return res.status(404).json({ error: 'City not found' });
    const { latitude, longitude } = geoData.results[0];

    // Open-Meteo current weather (no API key needed!)
    const wxRes  = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`);
    const wxData = await wxRes.json();
    const cur    = wxData.current;
    const cond   = getCondition(cur.weather_code);

    const result = {
      temperature: `${Math.round(cur.temperature_2m)}°C`,
      feelsLike:   `${Math.round(cur.apparent_temperature)}°C`,
      humidity:    `${cur.relative_humidity_2m}%`,
      wind:        `${Math.round(cur.wind_speed_10m)} km/h`,
      condition:   cond.label,
      icon:        cond.icon,
      updatedAt:   new Date().toISOString(),
    };

    cache.set(key, { data: result, ts: Date.now() });
    return res.json(result);
  } catch (err) {
    console.error('[Weather]', err.message);
    return res.status(500).json({ error: 'Weather fetch failed' });
  }
});

module.exports = router;
