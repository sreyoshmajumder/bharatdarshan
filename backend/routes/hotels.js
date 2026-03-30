const express = require('express');
const router  = express.Router();

const cache    = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000;

const METRO  = ['mumbai','delhi','bangalore','bengaluru','hyderabad','chennai','kolkata','pune','ahmedabad','surat'];
const HILL   = ['shimla','manali','darjeeling','mussoorie','ooty','munnar','coorg','nainital'];

function cityTier(name = '') {
  const n = name.toLowerCase();
  if (METRO.some(c => n.includes(c)))  return 'metro';
  if (HILL.some(c  => n.includes(c)))  return 'hill';
  return 'tourist';
}

const PRICE = {
  metro:   { hostel:[300,800],   budget:[1200,3000],  mid:[3000,9000],  luxury:[9000,35000]  },
  hill:    { hostel:[250,700],   budget:[800,2500],   mid:[2500,7000],  luxury:[7000,25000]  },
  tourist: { hostel:[250,600],   budget:[700,2000],   mid:[2000,6000],  luxury:[6000,20000]  },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a) + a); }

function priceRange(tourismType, capital) {
  const t  = tourismType || 'hotel';
  const tier = cityTier(capital);
  const p  = PRICE[tier];
  if (t === 'hostel')      return { min: p.hostel[0],   max: p.hostel[1],   label: 'per bed/night' };
  if (t === 'guest_house') return { min: p.budget[0],   max: p.budget[1],   label: 'per night' };
  const base = randInt(p.mid[0], p.mid[1]);
  return { min: base, max: Math.round(base * 1.7), label: 'per night' };
}

router.get('/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  const capital = req.query.capital || '';
  const key = `${lat},${lon}`;

  if (cache.has(key)) {
    const { data, ts } = cache.get(key);
    if (Date.now() - ts < CACHE_TTL) return res.json(data);
  }

  const q = `[out:json][timeout:25];(node["tourism"~"hotel|hostel|guest_house"](around:20000,${lat},${lon});way["tourism"~"hotel|hostel|guest_house"](around:20000,${lat},${lon}););out body;`;

  try {
    const resp = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
    const data = await resp.json();

    const hotels = (data.elements || [])
      .filter(el => el.tags?.name)
      .slice(0, 24)
      .map(el => ({
        id:        el.id,
        name:      el.tags.name,
        type:      el.tags.tourism || 'hotel',
        stars:     el.tags.stars || el.tags['hotel:stars'] || null,
        website:   el.tags.website || el.tags['contact:website'] || null,
        phone:     el.tags.phone || el.tags['contact:phone'] || null,
        address:   [el.tags['addr:street'], el.tags['addr:city'] || capital].filter(Boolean).join(', ') || capital,
        lat:       el.lat || el.center?.lat,
        lon:       el.lon || el.center?.lon,
        price:     priceRange(el.tags.tourism, capital),
        rating:    (3.4 + Math.random() * 1.5).toFixed(1),
        amenities: [
          el.tags['internet_access']   ? 'Free WiFi'    : null,
          el.tags.parking              ? 'Parking'      : null,
          el.tags.restaurant           ? 'Restaurant'   : null,
          el.tags.pool || el.tags.swimming_pool ? 'Pool' : null,
          el.tags.bar                  ? 'Bar'          : null,
          el.tags['room:count'] > 20   ? 'Conference'   : null,
        ].filter(Boolean),
      }));

    cache.set(key, { data: hotels, ts: Date.now() });
    return res.json(hotels);
  } catch (err) {
    console.error('[Hotels]', err.message);
    return res.status(500).json({ error: 'Could not fetch hotels' });
  }
});

module.exports = router;
