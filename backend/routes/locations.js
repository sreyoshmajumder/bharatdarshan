const router = require('express').Router();

const HISTORIC_LOCATIONS = [
  { id: 'hl_001', name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, type: 'Monument', century: '12th', emoji: '🕌', radius: 500 },
  { id: 'hl_002', name: 'Red Fort', lat: 28.6562, lng: 77.2410, type: 'Fort', century: '17th', emoji: '🏰', radius: 500 },
  { id: 'hl_003', name: 'Taj Mahal', lat: 27.1751, lng: 78.0421, type: 'Monument', century: '17th', emoji: '🕌', radius: 1000 },
  { id: 'hl_004', name: 'Charminar', lat: 17.3616, lng: 78.4747, type: 'Monument', century: '16th', emoji: '🕌', radius: 500 },
  { id: 'hl_005', name: 'Hawa Mahal', lat: 26.9239, lng: 75.8267, type: 'Palace', century: '18th', emoji: '🌬️', radius: 500 },
  { id: 'hl_006', name: 'Victoria Memorial', lat: 22.5448, lng: 88.3426, type: 'Memorial', century: '20th', emoji: '🏛️', radius: 500 },
  { id: 'hl_007', name: 'Gateway of India', lat: 18.9220, lng: 72.8347, type: 'Monument', century: '20th', emoji: '🗼', radius: 500 },
  { id: 'hl_008', name: 'Konark Sun Temple', lat: 19.8876, lng: 86.0946, type: 'Temple', century: '13th', emoji: '☀️', radius: 500 },
  { id: 'hl_009', name: 'Hampi Ruins', lat: 15.3350, lng: 76.4600, type: 'Heritage', century: '14th', emoji: '🏚️', radius: 2000 },
  { id: 'hl_010', name: 'Khajuraho Temples', lat: 24.8521, lng: 79.9218, type: 'Temple', century: '10th', emoji: '🛕', radius: 800 },
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const d2r = Math.PI / 180;
  const φ1 = lat1 * d2r, φ2 = lat2 * d2r;
  const Δφ = (lat2 - lat1) * d2r, Δλ = (lon2 - lon1) * d2r;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/locations/all
router.get('/all', (req, res) => {
  res.json({ locations: HISTORIC_LOCATIONS });
});

// GET /api/locations/nearby?lat=...&lng=...&radius=5000
router.get('/nearby', (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng are required.' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const searchRadius = parseFloat(radius);

  const nearby = HISTORIC_LOCATIONS
    .map(loc => ({
      ...loc,
      distance: Math.round(haversineDistance(userLat, userLng, loc.lat, loc.lng)),
    }))
    .filter(loc => loc.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance);

  res.json({ locations: nearby, count: nearby.length });
});

module.exports = router;
