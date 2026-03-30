import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { INDIA_HERO_IMAGES } from '../data/stateImages';

const ALL_MONUMENTS = [
  { id: 'm001', name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, type: 'Monument', century: '12th', emoji: '🕌', city: 'New Delhi', state: 'Delhi', desc: 'At 72.5m, this UNESCO minaret was the world\'s tallest when built in 1193 AD by Qutb-ud-din Aibak. Its five-storey red sandstone Indo-Afghan tower is a masterpiece of early Islamic architecture in India.', openHours: 'Sunrise to Sunset', entry: '₹35 (Indian), $5 (Foreign)', bestTime: 'Oct–Mar' },
  { id: 'm002', name: 'Red Fort', lat: 28.6562, lng: 77.2410, type: 'Fort', century: '17th', emoji: '🏰', city: 'New Delhi', state: 'Delhi', desc: 'Lal Qila — Emperor Shah Jahan\'s red sandstone masterpiece completed in 1648. The PM hoists the national flag here every Independence Day. Sprawls over 254 acres with palaces, halls and gardens.', openHours: '9:30 AM–4:30 PM (Tue–Sun)', entry: '₹35 / ₹500 foreign', bestTime: 'Oct–Feb' },
  { id: 'm003', name: 'Taj Mahal', lat: 27.1751, lng: 78.0421, type: 'Monument', century: '17th', emoji: '🕌', city: 'Agra', state: 'Uttar Pradesh', desc: 'Emperor Shah Jahan built this UNESCO ivory-white marble mausoleum (1632–1653) for his wife Mumtaz Mahal. Called the jewel of Muslim art in India; one of the Seven Wonders of the World.', openHours: 'Sunrise–Sunset (closed Fri)', entry: '₹50 / $15 foreign', bestTime: 'Oct–Mar' },
  { id: 'm004', name: 'Charminar', lat: 17.3616, lng: 78.4747, type: 'Monument', century: '16th', emoji: '🕌', city: 'Hyderabad', state: 'Telangana', desc: 'Built in 1591 by Sultan Muhammad Quli Qutb Shah to commemorate the founding of Hyderabad. Four ornate minarets rise 56m each. Houses a mosque on the top floor used by worshippers for 400+ years.', openHours: '9:30 AM–5:30 PM', entry: '₹25 / ₹300 foreign', bestTime: 'Oct–Feb' },
  { id: 'm005', name: 'Hawa Mahal', lat: 26.9239, lng: 75.8267, type: 'Palace', century: '18th', emoji: '🌬️', city: 'Jaipur', state: 'Rajasthan', desc: 'Palace of Winds built in 1799 by Maharaja Sawai Pratap Singh. The pink sandstone facade has 953 small windows (jharokhas) arranged like a honeycomb, allowing royal ladies to observe street life unseen.', openHours: '9 AM–5 PM', entry: '₹50 / ₹200 foreign', bestTime: 'Oct–Mar' },
  { id: 'm006', name: 'Victoria Memorial', lat: 22.5448, lng: 88.3426, type: 'Memorial', century: '20th', emoji: '🏛️', city: 'Kolkata', state: 'West Bengal', desc: 'Dedicated to Queen Victoria, built between 1906–1921 in Kolkata. White Makrana marble blends British and Mughal architecture. Now a museum with over 25,000 artifacts. Angel of Victory crowns the dome.', openHours: '10 AM–5 PM (closed Mon)', entry: '₹30 / ₹500 foreign', bestTime: 'Oct–Mar' },
  { id: 'm007', name: 'Gateway of India', lat: 18.9220, lng: 72.8347, type: 'Monument', century: '20th', emoji: '🗼', city: 'Mumbai', state: 'Maharashtra', desc: 'Iconic 26m basalt arch built in 1924 to commemorate King George V\'s 1911 visit. It was the first structure seen by immigrants arriving by sea at Bombay. Last British troops left through this gate in 1948.', openHours: 'Open 24hrs (area)', entry: 'Free', bestTime: 'Nov–Feb' },
  { id: 'm008', name: 'Konark Sun Temple', lat: 19.8876, lng: 86.0946, type: 'Temple', century: '13th', emoji: '☀️', city: 'Konark', state: 'Odisha', desc: 'UNESCO World Heritage 13th century chariot temple of Surya (Sun God). Designed as a colossal solar chariot with 24 intricately carved stone wheels. The wheels function as precise sundials accurate to minutes.', openHours: '6 AM–8 PM', entry: '₹40 / ₹600 foreign', bestTime: 'Nov–Feb' },
  { id: 'm009', name: 'Mysore Palace', lat: 12.3052, lng: 76.6552, type: 'Palace', century: '20th', emoji: '👑', city: 'Mysore', state: 'Karnataka', desc: 'Official residence of the Wadiyar dynasty, rebuilt in 1912 by British architect Henry Irwin. Indo-Saracenic style with ornamental arches and domes. Illuminated with 97,000 bulbs during Dasara festival.', openHours: '10 AM–5:30 PM', entry: '₹100 / ₹200 foreign', bestTime: 'Oct–Feb' },
  { id: 'm010', name: 'Agra Fort', lat: 27.1800, lng: 78.0219, type: 'Fort', century: '16th', emoji: '🏯', city: 'Agra', state: 'Uttar Pradesh', desc: 'UNESCO World Heritage Mughal fort built by Akbar in 1565, later modified by Shah Jahan. Houses the Diwan-i-Am, Moti Masjid, Khas Mahal. Shah Jahan was imprisoned here by his son Aurangzeb.', openHours: '6 AM–6 PM', entry: '₹35 / ₹550 foreign', bestTime: 'Oct–Mar' },
  { id: 'm011', name: 'Fatehpur Sikri', lat: 27.0945, lng: 77.6539, type: 'Heritage', century: '16th', emoji: '🏛️', city: 'Agra district', state: 'Uttar Pradesh', desc: 'UNESCO ghost capital of India — Emperor Akbar\'s magnificent abandoned city built in 1569. The Buland Darwaza (52m high) is Asia\'s largest gateway. Abandoned just 15 years after completion due to water scarcity.', openHours: 'Sunrise–Sunset', entry: '₹40 / ₹600 foreign', bestTime: 'Oct–Mar' },
  { id: 'm012', name: 'Golden Temple', lat: 31.6200, lng: 74.8765, type: 'Spiritual', century: '16th', emoji: '⭐', city: 'Amritsar', state: 'Punjab', desc: 'Harmandir Sahib — holiest Sikh shrine, built in 1589. The lower half of marble with inlay work, upper covered in 750kg of gold. Free langar (community kitchen) serves 100,000 meals daily to all visitors.', openHours: 'Open 24hrs', entry: 'Free', bestTime: 'Oct–Mar' },
  { id: 'm013', name: 'Hampi Ruins', lat: 15.3350, lng: 76.4600, type: 'Heritage', century: '14th', emoji: '🏚️', city: 'Hampi', state: 'Karnataka', desc: 'UNESCO World Heritage ruins of the Vijayanagara Empire capital (1336–1646). A surreal landscape of granite boulders scattered among 500+ monuments including Virupaksha temple, Vitthala and the stone chariot.', openHours: '6 AM–6 PM', entry: '₹40 / ₹600 foreign', bestTime: 'Oct–Feb' },
  { id: 'm014', name: 'Nalanda University Ruins', lat: 25.1357, lng: 85.4440, type: 'Heritage', century: '5th', emoji: '📚', city: 'Nalanda', state: 'Bihar', desc: 'UNESCO ruins of the world\'s first residential university, established 5th century AD. Attracted 10,000 students from across Asia teaching Buddhist philosophy, mathematics, medicine and astronomy.', openHours: '9 AM–5 PM', entry: '₹15 / $5 foreign', bestTime: 'Oct–Mar' },
  { id: 'm015', name: 'Meenakshi Temple', lat: 9.9195, lng: 78.1193, type: 'Temple', century: '17th', emoji: '🛕', city: 'Madurai', state: 'Tamil Nadu', desc: '17th century Dravidian temple complex dedicated to goddess Meenakshi and Sundareswarar. 14 colourful gopurams (towers) covered with thousands of stucco figures. 33,000 sculptures kaleidoscope inside.', openHours: '5 AM–8 PM', entry: '₹50 (camera fee)', bestTime: 'Nov–Feb' },
  { id: 'm016', name: 'Ajanta Caves', lat: 20.5514, lng: 75.7033, type: 'Heritage', century: '2nd BC', emoji: '🎨', city: 'Aurangabad', state: 'Maharashtra', desc: 'UNESCO rock-cut Buddhist cave monuments (2nd century BC – 7th century AD). 30 caves contain world\'s finest surviving examples of ancient Indian art including paintings depicting the Jataka tales.', openHours: '9 AM–5 PM (closed Mon)', entry: '₹40 / ₹600 foreign', bestTime: 'Nov–Mar' },
  { id: 'm017', name: 'Ellora Caves', lat: 20.0266, lng: 75.1780, type: 'Heritage', century: '5th', emoji: '⛏️', city: 'Aurangabad', state: 'Maharashtra', desc: 'UNESCO complex with 34 rock-cut temples representing Buddhism, Hinduism and Jainism. Kailash Temple (Cave 16) — carved out of single rock — is a monument to human patience and vision.', openHours: '9 AM–5 PM (closed Tue)', entry: '₹40 / ₹600 foreign', bestTime: 'Nov–Mar' },
  { id: 'm018', name: 'Khajuraho Temples', lat: 24.8521, lng: 79.9218, type: 'Temple', century: '10th', emoji: '🛕', city: 'Khajuraho', state: 'Madhya Pradesh', desc: 'UNESCO temples built by Chandela dynasty (950–1050 AD). 20 out of 85 temples survive with intricate erotic and spiritual sculptures — representing kama (desire) as one of four purusharthas (life goals).', openHours: '8 AM–6 PM', entry: '₹40 / ₹600 foreign', bestTime: 'Oct–Mar' },
  { id: 'm019', name: 'Sanchi Stupa', lat: 23.4793, lng: 77.7395, type: 'Heritage', century: '3rd BC', emoji: '☸️', city: 'Sanchi', state: 'Madhya Pradesh', desc: 'UNESCO Great Stupa commissioned by Emperor Ashoka in 3rd century BC. Oldest stone structure in India. The four ornate gateways (toranas) with carvings narrate the life of Buddha and Jataka stories.', openHours: 'Sunrise–Sunset', entry: '₹30 / ₹500 foreign', bestTime: 'Oct–Mar' },
  { id: 'm020', name: 'Golconda Fort', lat: 17.3833, lng: 78.4011, type: 'Fort', century: '16th', emoji: '🏰', city: 'Hyderabad', state: 'Telangana', desc: 'Qutb Shahi dynasty fort built between 14th–17th centuries. Famous for its whispering galleries and acoustic design — a clap at the entrance gate is heard 1km away at the apex. Once the world\'s diamond center.', openHours: '9 AM–5:30 PM', entry: '₹15 / ₹200 foreign', bestTime: 'Oct–Feb' },
  { id: 'm021', name: 'Amber Fort', lat: 26.9855, lng: 75.8513, type: 'Fort', century: '16th', emoji: '🏯', city: 'Jaipur', state: 'Rajasthan', desc: 'Magnificent Rajput fort-palace built by Raja Man Singh I in 1592. Sprawls over 4 sq km. Sheesh Mahal (Hall of Mirrors) reflects candlelight off millions of tiny mirrors creating a starry-night effect.', openHours: '8 AM–5:30 PM', entry: '₹100 / ₹500 foreign', bestTime: 'Oct–Mar' },
  { id: 'm022', name: 'Jaisalmer Fort', lat: 26.9124, lng: 70.9083, type: 'Fort', century: '12th', emoji: '🏰', city: 'Jaipur', state: 'Rajasthan', desc: 'Living fort rising from the Thar Desert, built in 1156 AD by Rawal Jaisal. One of the world\'s few living forts — a quarter of Jaisalmer\'s population lives inside. Glows golden at sunset (Sonar Quila).', openHours: '9 AM–5 PM', entry: '₹50 / ₹250 foreign', bestTime: 'Oct–Feb' },
  { id: 'm023', name: 'Tawang Monastery', lat: 27.5860, lng: 91.8617, type: 'Spiritual', century: '17th', emoji: '☸️', city: 'Tawang', state: 'Arunachal Pradesh', desc: 'Galden Namgey Lhatse — largest Buddhist monastery in India, 2nd largest in Asia, founded in 1681 at 3048m. Houses 700 monks and a 8m gilded Buddha statue. Overlooks breathtaking Himalayan valleys.', openHours: '8 AM–4 PM', entry: 'Free', bestTime: 'Apr–Jun, Sep–Nov' },
  { id: 'm024', name: 'Kaziranga NP', lat: 26.5775, lng: 93.1699, type: 'Wildlife', century: '20th', emoji: '🦏', city: 'Golaghat', state: 'Assam', desc: 'UNESCO World Heritage park hosting 2/3 of world\'s one-horned rhinoceroses. Also has highest density of tigers of any protected area on Earth. Jeep and elephant safaris through flood plains.', openHours: 'Nov–Apr', entry: '₹100 / $25 foreign', bestTime: 'Nov–Apr' },
  { id: 'm025', name: 'Bodh Gaya Mahabodhi', lat: 24.6963, lng: 84.9914, type: 'Spiritual', century: '3rd BC', emoji: '☸️', city: 'Bodh Gaya', state: 'Bihar', desc: 'UNESCO site marking where Siddhartha Gautama attained enlightenment under the Bodhi Tree, c.500 BC. The Mahabodhi Temple (5th–7th century AD) surrounds the sacred tree. Most important Buddhist pilgrimage site.', openHours: '5 AM–9 PM', entry: 'Free', bestTime: 'Oct–Mar' },
  { id: 'm026', name: 'Varanasi Ghat', lat: 25.3176, lng: 82.9739, type: 'Spiritual', century: 'Ancient', emoji: '🔥', city: 'Varanasi', state: 'Uttar Pradesh', desc: 'The ghats of Varanasi on the Ganga are among the oldest continuously inhabited places on Earth (over 3000 years). Dashashwamedh Ghat hosts Ganga Aarti every evening — a spectacular fire ceremony.', openHours: 'Open 24hrs', entry: 'Free', bestTime: 'Oct–Mar' },
  { id: 'm027', name: 'Mehrangarh Fort', lat: 26.2973, lng: 73.0174, type: 'Fort', century: '15th', emoji: '⚔️', city: 'Jodhpur', state: 'Rajasthan', desc: 'One of India\'s largest forts, standing 400 ft above the Blue City of Jodhpur. Built by Rao Jodha in 1459. Museum inside holds royal palanquins, weapons, costumes. Breathtaking view of the blue city below.', openHours: '9 AM–5 PM', entry: '₹100 / ₹600 foreign', bestTime: 'Oct–Mar' },
  { id: 'm028', name: 'Brihadeeswara Temple', lat: 10.7828, lng: 79.1318, type: 'Temple', century: '11th', emoji: '🛕', city: 'Thanjavur', state: 'Tamil Nadu', desc: 'UNESCO Great Temple of Thanjavur, built by Chola king Rajaraja I in 1010 AD. Its 66m vimana (tower) casts no shadow at noon. Dedicated to Shiva, with 250 Shivalingams and massive Nandi (82 tonnes).', openHours: '6 AM–8:30 PM', entry: 'Free', bestTime: 'Nov–Mar' },
  { id: 'm029', name: 'Ranakpur Temple', lat: 25.1164, lng: 73.4706, type: 'Temple', century: '15th', emoji: '🕍', city: 'Ranakpur', state: 'Rajasthan', desc: 'Exquisite 15th century Jain temple with 1,444 intricately carved marble pillars — no two alike. The temple complex is surrounded by forests in the Aravalli Hills. One of the five major pilgrimage sites of Jainism.', openHours: '12 PM–5 PM (non-Jains)', entry: '₹200', bestTime: 'Oct–Mar' },
  { id: 'm030', name: 'Gol Gumbaz', lat: 17.3325, lng: 76.8236, type: 'Monument', century: '17th', emoji: '🕌', city: 'Bijapur', state: 'Karnataka', desc: 'Mausoleum of Muhammad Adil Shah built in 1656. Has the world\'s 2nd largest dome (unsupported) after St. Peter\'s Basilica. The Whispering Gallery under the dome amplifies sound — a whisper heard across 38m.', openHours: '6 AM–6 PM', entry: '₹25 / ₹300 foreign', bestTime: 'Oct–Mar' },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const d2r = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * d2r / 2) ** 2 +
    Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin((lon2 - lon1) * d2r / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

const TYPE_COLORS = {
  'Monument': '#FF6B2B',
  'Fort': '#F59E0B',
  'Temple': '#8B5CF6',
  'Spiritual': '#EC4899',
  'Heritage': '#00D4AA',
  'Palace': '#FFD700',
  'Memorial': '#3B82F6',
  'Wildlife': '#22c55e',
};

export default function NearbyPage() {
  const [pos, setPos] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(500);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [selected, setSelected] = useState(null);
  const watchRef = useRef(null);

  const types = ['All', ...Object.keys(TYPE_COLORS)];

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return; }
    setLoading(true);
    setError(null);
    watchRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        setPos({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy });
        setLoading(false);
      },
      (e) => { setError('Location access denied. Please allow location.'); setLoading(false); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    startTracking();
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [startTracking]);

  const monuments = pos
    ? ALL_MONUMENTS
      .map(m => ({ ...m, distance: haversine(pos.lat, pos.lng, m.lat, m.lng) }))
      .filter(m => m.distance <= radius && (typeFilter === 'All' || m.type === typeFilter))
      .sort((a, b) => sortBy === 'distance' ? a.distance - b.distance : a.name.localeCompare(b.name))
    : [];

  // Always show all sorted by distance when no radius filter applies for the "all monuments" view
  const allByDistance = pos
    ? ALL_MONUMENTS
      .map(m => ({ ...m, distance: haversine(pos.lat, pos.lng, m.lat, m.lng) }))
      .filter(m => typeFilter === 'All' || m.type === typeFilter)
      .sort((a, b) => sortBy === 'distance' ? a.distance - b.distance : a.name.localeCompare(b.name))
    : [];

  const displayList = radius === 99999 ? allByDistance : monuments;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#000' }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 0 50px', minHeight: 360 }}>
        {/* Background image — Red Fort */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${INDIA_HERO_IMAGES.nearby})`,
          backgroundSize: 'cover', backgroundPosition: 'center 35%',
          filter: 'brightness(0.50) saturate(1.1)',
          transform: 'scale(1.04)',
        }} />
        {/* Gradient vignette */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.68) 65%, #000 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(0,212,170,0.12) 0%, transparent 50%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="section-label" style={{
            textShadow: '0 1px 6px rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            background: 'rgba(0,212,170,0.15)', borderColor: 'rgba(0,212,170,0.3)', color: 'var(--clr-teal-light)'
          }}>
            📍 Nearby Monuments
          </span>
          <h1 className="section-title" style={{ marginTop: 12, textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)', color: '#f5f5f7' }}>
            Discover Heritage <span className="teal-text">Near You</span>
          </h1>
          <p style={{ color: 'rgba(245,245,247,0.75)', maxWidth: 580, lineHeight: 1.7, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
            Using your live GPS location, we show every historic monument, temple, fort,
            and cultural site in India sorted by distance from you — complete with descriptions,
            entry details and best visit times.
          </p>
          {/* Location Status */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'rgba(4,4,8,0.78)', border: `1px solid ${pos ? 'rgba(34,197,94,0.4)' : error ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 14, padding: '12px 20px', marginTop: 24,
            backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}>
            {loading && <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />}
            {pos && <div className="live-dot" />}
            {error && <span style={{ fontSize: '1.1rem' }}>⚠️</span>}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: pos ? '#22c55e' : error ? '#ef4444' : 'var(--clr-text-secondary)' }}>
                {loading ? 'Locating you...' : pos ? 'Live Location Active' : error ? 'Location Error' : 'Location Required'}
              </div>
              {pos && (
                <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                  {pos.lat.toFixed(5)}°N, {pos.lng.toFixed(5)}°E · Accuracy ±{Math.round(pos.accuracy)}m
                </div>
              )}
              {error && <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: 2 }}>{error}</div>}
            </div>
            {error && (
              <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={startTracking}>
                Retry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'sticky', top: 70, zIndex: 100,
        background: 'rgba(6,11,24,0.97)', borderBottom: '1px solid var(--clr-border)',
        backdropFilter: 'blur(20px)', padding: '14px 0',
      }}>
        <div className="container" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Radius */}
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', alignSelf: 'center', marginRight: 4 }}>Radius:</span>
            {[
              { v: 50, l: '50km' }, { v: 200, l: '200km' }, { v: 500, l: '500km' }, { v: 99999, l: 'All India' }
            ].map(({ v, l }) => (
              <button key={v} onClick={() => setRadius(v)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: radius === v ? 'var(--clr-teal)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${radius === v ? 'var(--clr-teal)' : 'var(--clr-border)'}`,
                  color: radius === v ? '#000' : 'var(--clr-text-secondary)',
                }}>
                {l}
              </button>
            ))}
          </div>
          {/* Type */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {types.map(t => {
              const c = TYPE_COLORS[t] || 'var(--clr-saffron)';
              return (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: typeFilter === t ? c : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${typeFilter === t ? c : 'var(--clr-border)'}`,
                    color: typeFilter === t ? 'white' : 'var(--clr-text-secondary)',
                  }}>
                  {t}
                </button>
              );
            })}
          </div>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--clr-border)',
              color: 'var(--clr-text-secondary)', padding: '6px 12px', borderRadius: 10,
              fontSize: '0.78rem', cursor: 'pointer', outline: 'none',
            }}>
            <option value="distance">Sort: Nearest First</option>
            <option value="name">Sort: A–Z</option>
          </select>
          {pos && (
            <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginLeft: 'auto' }}>
              {displayList.length} monuments found
            </span>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px var(--space-xl)', display: 'flex', gap: 24 }}>
        {/* Monument List */}
        <div style={{ flex: 1 }}>
          {!pos && !error && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>📍</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>Requesting Your Location</h3>
              <p style={{ color: 'var(--clr-text-secondary)' }}>Please allow location access to discover nearby monuments.</p>
            </div>
          )}
          {pos && displayList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 8 }}>No Monuments Found Nearby</h3>
              <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 20 }}>Try increasing the search radius.</p>
              <button className="btn btn-primary" onClick={() => setRadius(99999)}>Show All India</button>
            </div>
          )}

          {displayList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {displayList.map((m, i) => {
                const color = TYPE_COLORS[m.type] || 'var(--clr-saffron)';
                const isSelected = selected?.id === m.id;
                return (
                  <div
                    key={m.id}
                    id={`monument-${m.id}`}
                    onClick={() => setSelected(isSelected ? null : m)}
                    style={{
                      background: isSelected ? `${color}10` : 'var(--clr-bg-card)',
                      border: `1px solid ${isSelected ? color : 'var(--clr-border)'}`,
                      borderRadius: 16, padding: 0, overflow: 'hidden',
                      cursor: 'pointer', transition: 'all 0.3s',
                      boxShadow: isSelected ? `0 8px 32px ${color}25` : 'none',
                    }}
                    onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = color)}
                    onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--clr-border)')}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                      {/* Rank */}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: i < 3 ? color : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800, color: i < 3 ? 'white' : 'var(--clr-text-muted)',
                        flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      {/* Emoji */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: `${color}18`, border: `1px solid ${color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem', flexShrink: 0,
                      }}>{m.emoji}</div>
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                          {m.city}, {m.state} · {m.century} Century
                        </div>
                      </div>
                      {/* Type badge */}
                      <span style={{
                        background: `${color}15`, border: `1px solid ${color}30`,
                        color, padding: '3px 10px', borderRadius: 20,
                        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                      }}>{m.type}</span>
                      {/* Distance */}
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 64 }}>
                        <div style={{
                          fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem',
                          color: m.distance < 5 ? '#22c55e' : m.distance < 50 ? 'var(--clr-teal)' : m.distance < 200 ? 'var(--clr-saffron)' : 'var(--clr-text-muted)',
                        }}>
                          {formatDist(m.distance)}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-muted)' }}>away</div>
                      </div>
                      <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', transform: isSelected ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>›</span>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${color}20` }}>
                        <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.75, fontSize: '0.88rem', marginTop: 16, marginBottom: 16 }}>
                          {m.desc}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
                          {[
                            { icon: '🕐', label: 'Open Hours', value: m.openHours },
                            { icon: '🎫', label: 'Entry Fee', value: m.entry },
                            { icon: '📅', label: 'Best Time', value: m.bestTime },
                            { icon: '📍', label: 'Distance', value: formatDist(m.distance) },
                          ].map((item, j) => (
                            <div key={j} style={{
                              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--clr-border)',
                              borderRadius: 10, padding: '10px 12px',
                            }}>
                              <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                                {item.icon} {item.label}
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn btn-teal"
                            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                            onClick={e => e.stopPropagation()}
                          >
                            🧭 Get Directions
                          </a>
                          <a
                            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(m.name)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                            onClick={e => e.stopPropagation()}
                          >
                            📖 Wikipedia
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar — Distance rings legend */}
        <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)',
            borderRadius: 16, padding: 16, position: 'sticky', top: 140,
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-text-muted)', marginBottom: 12 }}>
              Distance Guide
            </div>
            {[
              { label: 'Very Near', range: '< 5km', color: '#22c55e', desc: 'Walking distance' },
              { label: 'Near', range: '5–50km', color: 'var(--clr-teal)', desc: 'Short drive' },
              { label: 'Day Trip', range: '50–200km', color: 'var(--clr-saffron)', desc: 'Same day visit' },
              { label: 'Weekend', range: '200–500km', color: '#F59E0B', desc: 'Overnight trip' },
              { label: 'Far', range: '>500km', color: 'var(--clr-text-muted)', desc: 'Plan ahead' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: d.color }}>{d.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>{d.range} · {d.desc}</div>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clr-text-muted)', marginBottom: 10 }}>
                Monument Types
              </div>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-secondary)' }}>{type}</span>
                </div>
              ))}
            </div>

            {pos && (
              <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 12, marginTop: 4 }}>
                <div className="live-dot" style={{ marginBottom: 6 }}>Live GPS</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>
                  {pos.lat.toFixed(4)}°N<br />
                  {pos.lng.toFixed(4)}°E<br />
                  ±{Math.round(pos.accuracy)}m accuracy
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
