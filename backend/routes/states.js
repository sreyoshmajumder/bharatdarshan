const router = require('express').Router();

const STATES_DATA = [
  {
    id: 'rajasthan', name: 'Rajasthan', capital: 'Jaipur',
    region: 'North India', lat: 27.0238, lng: 74.2179,
    tagline: 'The Land of Kings', temperature: '28°C', weather: 'Sunny & Dry',
    population: '68.5M', language: 'Hindi, Rajasthani',
  },
  {
    id: 'kerala', name: 'Kerala', capital: 'Thiruvananthapuram',
    region: 'South India', lat: 10.8505, lng: 76.2711,
    tagline: "God's Own Country", temperature: '31°C', weather: 'Humid & Warm',
    population: '33.4M', language: 'Malayalam',
  },
  {
    id: 'maharashtra', name: 'Maharashtra', capital: 'Mumbai',
    region: 'West India', lat: 19.7515, lng: 75.7139,
    tagline: 'The City of Dreams', temperature: '32°C', weather: 'Partly Cloudy',
    population: '112M', language: 'Marathi, Hindi',
  },
  {
    id: 'uttarpradesh', name: 'Uttar Pradesh', capital: 'Lucknow',
    region: 'North India', lat: 26.8467, lng: 80.9462,
    tagline: 'The Heart of India', temperature: '30°C', weather: 'Clear',
    population: '200M', language: 'Hindi, Urdu',
  },
  {
    id: 'himachalpradesh', name: 'Himachal Pradesh', capital: 'Shimla',
    region: 'North India', lat: 31.1048, lng: 77.1734,
    tagline: 'Dev Bhoomi', temperature: '12°C', weather: 'Cool & Breezy',
    population: '6.8M', language: 'Hindi, Pahari',
  },
  {
    id: 'goa', name: 'Goa', capital: 'Panaji',
    region: 'West India', lat: 15.2993, lng: 74.1240,
    tagline: 'Pearl of the Orient', temperature: '33°C', weather: 'Sunny & Tropical',
    population: '1.5M', language: 'Konkani, English',
  },
];

// GET /api/states
router.get('/', (req, res) => {
  const { region, search } = req.query;
  let states = [...STATES_DATA];
  if (region) states = states.filter(s => s.region.toLowerCase().includes(region.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    states = states.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.capital.toLowerCase().includes(q)
    );
  }
  res.json({ states, total: states.length });
});

// GET /api/states/:id
router.get('/:id', (req, res) => {
  const state = STATES_DATA.find(s => s.id === req.params.id);
  if (!state) return res.status(404).json({ message: 'State not found.' });
  res.json({ state });
});

module.exports = router;
