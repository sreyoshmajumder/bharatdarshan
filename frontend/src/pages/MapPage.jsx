import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { INDIA_STATES, HISTORIC_LOCATIONS } from '../data/indiaData';
import { ALL_INDIA_STATES } from '../data/allStates';
import { useNotif } from '../context/NotifContext';
import API from '../config/api';

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ALL_STATES = [...INDIA_STATES, ...ALL_INDIA_STATES];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── TRIP PLANNER PANEL ─────────────────────────────────
const PLAN_STYLES = [
  { id: 'cultural',   icon: '🏛️', label: 'Cultural'  },
  { id: 'adventure',  icon: '🏔️', label: 'Adventure' },
  { id: 'mixed',      icon: '🗺️', label: 'Explorer'  },
];

const EVENINGS = [
  'Sunset aarti at the riverbank',
  'Sound & Light Show at the fort',
  'Local street food trail',
  'Folk dance cultural show',
  'Rooftop dinner with panorama',
];

function buildPlans(stateData, days, budget, style) {
  if (!stateData) return [];
  const raw = stateData.places || [];
  const heritage = raw.filter(p => ['Heritage','Monument','Fort','Palace','Memorial','Spiritual','Temple'].includes(p.type));
  const nature   = raw.filter(p => ['Nature','Wildlife','Beach','Hill Station','Adventure','Waterfall'].includes(p.type));
  const all      = [...heritage, ...nature, ...raw.filter(p => !heritage.includes(p) && !nature.includes(p))];

  const makeDay = (morning, afternoon, idx) => ({
    day: idx + 1,
    morning:   morning   ? `Visit ${morning.name}`   : `Morning walk in ${stateData.capital}`,
    afternoon: afternoon ? `Explore ${afternoon.name}` : `Local market & cuisine`,
    evening:   EVENINGS[idx % EVENINGS.length],
    cost:      budget,
  });

  return [
    {
      id: 'cultural', title: 'Heritage & Culture Trail', icon: '🏛️', color: '#FF6B2B',
      tag: 'Best for history lovers & photographers',
      days: Array.from({ length: days }, (_, i) => makeDay(heritage[i*2], heritage[i*2+1], i)),
      total: budget * days,
    },
    {
      id: 'adventure', title: 'Nature & Adventure Circuit', icon: '🌿', color: '#00D4AA',
      tag: 'Best for thrill seekers & nature lovers',
      days: Array.from({ length: days }, (_, i) => makeDay(nature[i*2] || all[i*2], nature[i*2+1] || all[i*2+1], i)),
      total: Math.round(budget * days * 1.1),
    },
    {
      id: 'balanced', title: 'Complete Discovery Route', icon: '✨', color: '#8B5CF6',
      tag: 'Best for families & first-time visitors',
      days: Array.from({ length: days }, (_, i) => makeDay(all[i*2], all[i*2+1] || heritage[i], i)),
      total: Math.round(budget * days * 1.05),
    },
  ];
}

function PlannerPanel({ onClose }) {
  const today    = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [stateId,  setStateId]  = useState('rajasthan');
  const [start,    setStart]    = useState(today);
  const [end,      setEnd]      = useState(nextWeek);
  const [budget,   setBudget]   = useState('mid');
  const [style,    setStyle]    = useState('mixed');
  const [plans,    setPlans]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(null);

  const BUDGETS = { budget: 1500, mid: 5000, luxury: 15000 };
  const stateData = ALL_STATES.find(s => s.id === stateId);
  const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000));
  const inp = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '9px 12px', color: '#f5f5f7',
    fontFamily: 'inherit', fontSize: '0.8rem', width: '100%', outline: 'none', colorScheme: 'dark',
  };

  const generate = () => {
    setLoading(true); setPlans(null); setExpanded(null);
    setTimeout(() => {
      setPlans(buildPlans(stateData, days, BUDGETS[budget], style));
      setLoading(false);
    }, 1400);
  };

  return (
    <div style={{
      position: 'absolute', top: 70, left: 0, right: 0, zIndex: 800,
      background: 'rgba(8,8,10,0.97)', backdropFilter: 'blur(40px)',
      borderBottom: '1px solid rgba(255,107,43,0.2)',
      maxHeight: 'calc(100vh - 70px)', overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.14em', color: '#FF6B2B', textTransform: 'uppercase', marginBottom: 6 }}>
              ✈️ AI Trip Planner
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: '#f5f5f7', margin: 0 }}>
              Plan Your Perfect India Journey
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)', color: '#f5f5f7', cursor: 'pointer',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}>✕</button>
        </div>

        {/* Form */}
        {!plans && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Destination</div>
              <select value={stateId} onChange={e => setStateId(e.target.value)} style={inp} id="planner-state">
                {ALL_STATES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>From Date</div>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inp} id="planner-start" min={today} />
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>To Date</div>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inp} id="planner-end" min={start} />
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Budget/Day</div>
              <select value={budget} onChange={e => setBudget(e.target.value)} style={inp} id="planner-budget">
                <option value="budget">🎒 Budget (₹500–2K)</option>
                <option value="mid">🏨 Comfortable (₹3K–7K)</option>
                <option value="luxury">👑 Luxury (₹12K+)</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Travel Style</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {PLAN_STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)} style={{
                    flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                    background: style === s.id ? 'rgba(255,107,43,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${style === s.id ? '#FF6B2B' : 'rgba(255,255,255,0.1)'}`,
                    color: style === s.id ? '#FF6B2B' : 'rgba(245,245,247,0.5)', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button id="planner-generate-btn" onClick={generate} style={{
                width: '100%', padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #FF6B2B, #FF8C4A)',
                color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.85rem',
                boxShadow: '0 6px 24px rgba(255,107,43,0.35)',
              }}>
                ✨ Generate {days}D Plan
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite', display: 'inline-block', marginBottom: 12 }}>🗺️</div>
            <p style={{ color: 'rgba(245,245,247,0.4)', fontSize: '0.9rem' }}>Crafting 3 perfect itineraries for {stateData?.name}…</p>
          </div>
        )}

        {plans && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(245,245,247,0.5)' }}>
                3 plans for <span style={{ color: '#FF6B2B', fontWeight: 700 }}>{stateData?.name}</span> · {days} days
              </div>
              <button onClick={() => setPlans(null)} style={{
                padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(245,245,247,0.55)',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem',
              }}>← New Plan</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
              {plans.map(plan => (
                <div key={plan.id} style={{
                  background: 'rgba(20,20,22,0.9)', border: `1px solid ${expanded === plan.id ? plan.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 18, overflow: 'hidden',
                  boxShadow: expanded === plan.id ? `0 16px 48px ${plan.color}22` : 'none',
                  transition: 'all 0.3s',
                }}>
                  <div style={{ padding: '20px 20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, background: `${plan.color}18`,
                        border: `1px solid ${plan.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                      }}>{plan.icon}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(245,245,247,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Total</div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.05rem', color: plan.color }}>
                          ₹{plan.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: '#f5f5f7', marginBottom: 4 }}>{plan.title}</h3>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(245,245,247,0.4)', marginBottom: 14 }}>{plan.tag}</p>
                    <button onClick={() => setExpanded(expanded === plan.id ? null : plan.id)} style={{
                      width: '100%', padding: '9px', borderRadius: 10, cursor: 'pointer',
                      background: expanded === plan.id ? `${plan.color}18` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${expanded === plan.id ? plan.color + '40' : 'rgba(255,255,255,0.08)'}`,
                      color: expanded === plan.id ? plan.color : 'rgba(245,245,247,0.5)',
                      fontFamily: 'inherit', fontWeight: 700, fontSize: '0.78rem', marginBottom: 16,
                      transition: 'all 0.2s',
                    }}>
                      {expanded === plan.id ? '▲ Hide Itinerary' : '▼ View Day-by-Day'}
                    </button>
                  </div>

                  {expanded === plan.id && (
                    <div style={{ padding: '0 20px 20px', maxHeight: 320, overflowY: 'auto' }}>
                      {plan.days.map((d, i) => (
                        <div key={i} style={{
                          padding: '12px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        }}>
                          <div style={{ fontWeight: 800, fontSize: '0.72rem', color: plan.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Day {d.day} — ₹{d.cost.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(245,245,247,0.6)', lineHeight: 1.8 }}>
                            <span style={{ color: '#FF6B2B' }}>☀</span> {d.morning}<br />
                            <span style={{ color: '#00D4AA' }}>🌤</span> {d.afternoon}<br />
                            <span style={{ color: '#8B5CF6' }}>🌙</span> {d.evening}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Link to={`/trip-planner`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                borderRadius: 12, background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.25)',
                color: '#FF6B2B', textDecoration: 'none', fontWeight: 700, fontSize: '0.82rem',
              }}>
                Open Full Planner with Details →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── HOTELS PANEL ───────────────────────────────────────
function HotelsPanel({ onClose }) {
  const [query,   setQuery]   = useState('');
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [searched, setSearched] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setHotels([]); setError(null);
    setSearched(query.trim());
    try {
      // Step 1: Geocode the place name
      const geoResp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
      );
      const geoData = await geoResp.json();
      const loc = geoData.results?.[0];
      if (!loc) { setError('Place not found. Try a city or state name.'); setLoading(false); return; }

      const { latitude, longitude, name: geoName, country } = loc;

      // Step 2: Fetch hotels from Overpass via backend
      const hotelResp = await fetch(
        `${API}/api/hotels/${latitude}/${longitude}?capital=${encodeURIComponent(geoName)}`
      );
      const data = await hotelResp.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError(`No hotels found in OpenStreetMap for "${geoName}". Try a larger city nearby.`);
        setLoading(false); return;
      }
      setHotels(data);
    } catch (e) {
      setError('Could not fetch hotels. Check your internet connection.');
    }
    setLoading(false);
  };

  const COLORS = { hotel: '#FF6B2B', hostel: '#00D4AA', guest_house: '#8B5CF6' };

  return (
    <div style={{
      position: 'absolute', top: 70, right: 0, bottom: 0, width: 380, zIndex: 800,
      background: 'rgba(6,6,8,0.97)', backdropFilter: 'blur(40px)',
      borderLeft: '1px solid rgba(255,107,43,0.15)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, background: 'rgba(6,6,8,0.98)', zIndex: 10,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.14em', color: '#FF6B2B', textTransform: 'uppercase', marginBottom: 4 }}>
              🏨 Hotel Finder
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.25rem', color: '#f5f5f7', margin: 0 }}>
              Find Hotels
            </h2>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)', color: '#f5f5f7', cursor: 'pointer',
            fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="hotel-search-input"
            type="text"
            placeholder="Enter city, state or place…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 12, padding: '11px 14px', color: '#f5f5f7',
              fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none',
            }}
          />
          <button id="hotel-search-btn" onClick={search} style={{
            padding: '11px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #FF6B2B, #FF8C4A)',
            color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: '0.82rem',
            boxShadow: '0 4px 16px rgba(255,107,43,0.3)',
          }}>
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, padding: '16px 24px 24px' }}>
        {!loading && !error && hotels.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.4 }}>🏨</div>
            <p style={{ color: 'rgba(245,245,247,0.3)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Enter a city or tourist destination<br />to find real hotels with prices
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Jaipur', 'Goa', 'Shimla', 'Varanasi'].map(s => (
                <button key={s} onClick={() => { setQuery(s); }} style={{
                  padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,107,43,0.2)',
                  background: 'rgba(255,107,43,0.08)', color: '#FF6B2B', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700,
                }}>
                  Try "{s}" →
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '2rem', animation: 'spin 1.5s linear infinite', display: 'inline-block', marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'rgba(245,245,247,0.35)', fontSize: '0.85rem' }}>Finding hotels in {query}…</p>
          </div>
        )}

        {error && (
          <div style={{ padding: 16, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', borderRadius: 14, marginBottom: 16 }}>
            <p style={{ color: 'rgba(255,100,100,0.8)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>⚠️ {error}</p>
            <a href={`https://www.google.com/travel/hotels/entity/${encodeURIComponent(query + ' India')}/hotels`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 10, padding: '6px 14px', background: 'rgba(255,107,43,0.12)', border: '1px solid rgba(255,107,43,0.3)', borderRadius: 8, color: '#FF6B2B', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>
              Search on Google Hotels →
            </a>
          </div>
        )}

        {hotels.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: 'rgba(245,245,247,0.4)' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>{hotels.length}</span> hotels near {searched}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'rgba(245,245,247,0.25)' }}>Prices estimated</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {hotels.map((h, i) => {
                const col = COLORS[h.type] || '#FF6B2B';
                return (
                  <div key={h.id || i} style={{
                    background: 'rgba(18,18,20,0.9)', backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16,
                    transition: 'all 0.25s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = col + '50'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = ''; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ flex: 1, paddingRight: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span>{h.type === 'hostel' ? '🛏️' : h.type === 'guest_house' ? '🏠' : '🏨'}</span>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', color: '#f5f5f7' }}>{h.name}</span>
                        </div>
                        <div style={{ fontSize: '0.67rem', color: 'rgba(245,245,247,0.35)', textTransform: 'capitalize' }}>
                          {h.type?.replace('_', ' ')}
                        </div>
                      </div>
                      {/* Star rating */}
                      <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                        {[...Array(5)].map((_, j) => (
                          <span key={j} style={{ fontSize: '0.65rem', color: j < Math.round(h.rating) ? '#FFD700' : 'rgba(255,255,255,0.12)' }}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Price badge */}
                    <div style={{
                      background: `${col}10`, border: `1px solid ${col}25`, borderRadius: 10,
                      padding: '8px 12px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.58rem', color: 'rgba(245,245,247,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                          Est. Price
                        </div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1rem', color: col }}>
                          ₹{h.price.min.toLocaleString('en-IN')}
                          <span style={{ fontWeight: 400, fontSize: '0.65rem', color: 'rgba(245,245,247,0.35)', marginLeft: 4 }}>–{h.price.max.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(245,245,247,0.3)' }}>{h.price.label}</div>
                    </div>

                    {/* Amenities */}
                    {h.amenities?.length > 0 && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                        {h.amenities.map((a, j) => (
                          <span key={j} style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 6, padding: '2px 7px', fontSize: '0.62rem', color: 'rgba(245,245,247,0.45)',
                          }}>{a}</span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={h.website || `https://www.google.com/travel/hotels?q=${encodeURIComponent(h.name + ' ' + searched)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          flex: 1, textAlign: 'center', padding: '8px', borderRadius: 10, textDecoration: 'none',
                          background: `${col}15`, border: `1px solid ${col}35`, color: col,
                          fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.2s',
                        }}>
                        {h.website ? '🔗 Website' : '📋 Check Prices'}
                      </a>
                      <a href={`https://www.makemytrip.com/hotels/hotel-listing/?checkin=today&checkout=tomorrow&roomCount=1&adultsCount=1&childCount=0&city=${encodeURIComponent(searched)}&hotelName=${encodeURIComponent(h.name)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          flex: 1, textAlign: 'center', padding: '8px', borderRadius: 10, textDecoration: 'none',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(245,245,247,0.55)', fontWeight: 700, fontSize: '0.75rem',
                        }}>
                        MakeMyTrip →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, fontSize: '0.67rem', color: 'rgba(245,245,247,0.25)', lineHeight: 1.5 }}>
              ℹ️ Hotel data from OpenStreetMap. Prices are estimates — book via hotel websites for exact rates.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── MAP PAGE ────────────────────────────────────────────
export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);
  const alertedSitesRef = useRef(new Set());
  const { addNotification } = useNotif();
  const [userPos, setUserPos] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStates, setFilteredStates] = useState(INDIA_STATES);
  const [activeLayer, setActiveLayer] = useState('dark');
  const [showPlanner, setShowPlanner] = useState(false);
  const [showHotels, setShowHotels] = useState(false);
  const layersRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) setFilteredStates(INDIA_STATES);
    else {
      const q = searchQuery.toLowerCase();
      setFilteredStates(INDIA_STATES.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery]);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const tileLayers = {
      dark:      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '© Esri' }),
      street:    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }),
    };
    layersRef.current = tileLayers;

    const map = L.map(mapRef.current, { center: [20.5937, 78.9629], zoom: 5, zoomControl: false, layers: [tileLayers.dark] });
    mapInstanceRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    HISTORIC_LOCATIONS.forEach(loc => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#FF6B2B,#FF8C55);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(255,107,43,0.5);border:2px solid rgba(255,255,255,0.3);"><span style="transform:rotate(45deg);font-size:1rem;">${loc.emoji}</span></div>`,
        iconSize: [36, 36], iconAnchor: [18, 36],
      });
      L.marker([loc.lat, loc.lng], { icon }).addTo(map).bindPopup(`
        <div style="font-family:'Inter',sans-serif;max-width:240px;padding:4px">
          <h4 style="font-family:'Outfit',sans-serif;margin:0 0 4px;font-size:1rem;color:#FF6B2B">${loc.emoji} ${loc.name}</h4>
          <span style="font-size:0.7rem;color:#8B9CC8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">${loc.type} · ${loc.century} Century</span>
          <p style="margin:8px 0 0;font-size:0.8rem;color:#ccc;line-height:1.5">${loc.importance}</p>
        </div>`, { maxWidth: 280 });
    });

    INDIA_STATES.forEach(state => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:rgba(0,212,170,0.15);border:2px solid ${state.color};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;cursor:pointer;">${state.emoji}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      });
      const marker = L.marker([state.lat, state.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:'Inter',sans-serif;max-width:220px;padding:4px">
          <h4 style="font-family:'Outfit',sans-serif;margin:0 0 4px;font-size:1rem;color:${state.color}">${state.emoji} ${state.name}</h4>
          <p style="margin:0 0 4px;font-size:0.75rem;color:#8B9CC8">${state.tagline}</p>
          <p style="margin:0 0 8px;font-size:0.78rem;color:#ccc">${state.weatherIcon} ${state.temperature} · ${state.weather}</p>
          <a href="/state/${state.id}" style="background:${state.color};color:white;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;text-decoration:none;display:inline-block;">Explore →</a>
        </div>`, { maxWidth: 260 });
      marker.on('click', () => setSelectedState(state));
    });

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current) return;
    const map = mapInstanceRef.current;
    Object.values(layersRef.current).forEach(l => { if (map.hasLayer(l)) map.removeLayer(l); });
    layersRef.current[activeLayer].addTo(map);
  }, [activeLayer]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserPos({ lat: latitude, lng: longitude, accuracy });
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          if (!userMarkerRef.current) {
            const userIcon = L.divIcon({ className: '', html: `<div style="width:20px;height:20px;background:#3B82F6;border-radius:50%;border:3px solid white;box-shadow:0 0 0 8px rgba(59,130,246,0.2);"></div>`, iconSize: [20, 20], iconAnchor: [10, 10] });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map).bindPopup('📍 You are here');
            userCircleRef.current = L.circle([latitude, longitude], { radius: accuracy, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 1 }).addTo(map);
          } else {
            userMarkerRef.current.setLatLng([latitude, longitude]);
            userCircleRef.current.setLatLng([latitude, longitude]);
            userCircleRef.current.setRadius(accuracy);
          }
          HISTORIC_LOCATIONS.forEach(site => {
            const dist = haversineDistance(latitude, longitude, site.lat, site.lng);
            if (dist < 500 && !alertedSitesRef.current.has(site.id)) {
              alertedSitesRef.current.add(site.id);
              addNotification({ emoji: site.emoji, title: `📍 You're near ${site.name}!`, body: `${site.type} · ${site.century} Century`, importance: site.importance.substring(0, 120) + '...' });
            }
          });
        }
      },
      err => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [addNotification]);

  const flyToState = useCallback((state) => {
    setSelectedState(state);
    if (mapInstanceRef.current) mapInstanceRef.current.flyTo([state.lat, state.lng], 7, { duration: 1.5 });
  }, []);

  const flyToUser = useCallback(() => {
    if (mapInstanceRef.current && userPos) mapInstanceRef.current.flyTo([userPos.lat, userPos.lng], 14, { duration: 1.5 });
  }, [userPos]);

  return (
    <div className="map-wrapper" id="map-page" style={{ position: 'relative' }}>
      {/* ── Top Toolbar ── */}
      <div style={{
        position: 'absolute', top: 70, left: 0, right: 0, zIndex: 700,
        display: 'flex', justifyContent: 'center', gap: 12, padding: '10px 24px',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', gap: 10, pointerEvents: 'all' }}>
          <button
            id="open-planner-btn"
            onClick={() => { setShowPlanner(p => !p); setShowHotels(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: showPlanner
                ? 'linear-gradient(135deg, #FF6B2B, #FF8C4A)'
                : 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(20px)',
              border: showPlanner ? 'none' : '1px solid rgba(255,107,43,0.35)',
              color: showPlanner ? '#fff' : '#FF6B2B',
              fontFamily: 'inherit', fontWeight: 800, fontSize: '0.88rem',
              boxShadow: showPlanner ? '0 8px 28px rgba(255,107,43,0.4)' : '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'all 0.3s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>✈️</span>
            Planner
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{showPlanner ? '▲' : '▼'}</span>
          </button>

          <button
            id="open-hotels-btn"
            onClick={() => { setShowHotels(h => !h); setShowPlanner(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 14, cursor: 'pointer',
              background: showHotels
                ? 'linear-gradient(135deg, #00D4AA, #00B090)'
                : 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(20px)',
              border: showHotels ? 'none' : '1px solid rgba(0,212,170,0.35)',
              color: showHotels ? '#fff' : '#00D4AA',
              fontFamily: 'inherit', fontWeight: 800, fontSize: '0.88rem',
              boxShadow: showHotels ? '0 8px 28px rgba(0,212,170,0.3)' : '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'all 0.3s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>🏨</span>
            Hotels
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{showHotels ? '▸' : '◂'}</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <div ref={mapRef} className="map-container" id="leaflet-map" />

      {/* Overlay Panels */}
      {showPlanner && <PlannerPanel onClose={() => setShowPlanner(false)} />}
      {showHotels  && <HotelsPanel  onClose={() => setShowHotels(false)}  />}

      {/* Left Sidebar */}
      <div className="map-sidebar" id="map-sidebar" style={{ zIndex: 600 }}>
        {/* Search */}
        <div className="map-info-box">
          <div className="map-info-title"><span>🔍</span> Search India</div>
          <input id="map-search-input" className="map-search" type="text" placeholder="Search states, cities, places..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Layer Toggle */}
        <div className="map-info-box">
          <div className="map-info-title"><span>🗂️</span> Map Layer</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {[{ id:'dark', label:'🌙 Dark', color:'#3B82F6' }, { id:'satellite', label:'🛰️ Satellite', color:'#22c55e' }, { id:'street', label:'🛣️ Street', color:'#F59E0B' }].map(layer => (
              <button key={layer.id} id={`layer-${layer.id}`} onClick={() => setActiveLayer(layer.id)} style={{ background: activeLayer===layer.id ? layer.color : 'rgba(255,255,255,0.06)', border: `1px solid ${activeLayer===layer.id ? layer.color : 'var(--clr-border)'}`, color: activeLayer===layer.id ? 'white' : 'var(--clr-text-secondary)', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s' }}>
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* My Location */}
        <div className="map-info-box">
          <div className="map-info-title"><span>📍</span> My Location</div>
          {userPos ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="live-dot">Live Tracking Active</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: '4px' }}>{userPos.lat.toFixed(4)}°N, {userPos.lng.toFixed(4)}°E</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Accuracy: ±{Math.round(userPos.accuracy)}m</div>
              <button id="fly-to-user-btn" className="btn btn-teal" style={{ padding: '8px 16px', fontSize: '0.8rem', marginTop: '4px' }} onClick={flyToUser}>📍 Center on Me</button>
            </div>
          ) : <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>Requesting location…</div>}
        </div>

        {/* States List */}
        <div className="map-info-box">
          <div className="map-info-title"><span>🗺️</span> Indian States</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            {filteredStates.map(state => (
              <button key={state.id} id={`map-state-${state.id}`} onClick={() => flyToState(state)} style={{ display:'flex', alignItems:'center', gap:'10px', background: selectedState?.id===state.id ? `${state.color}22` : 'rgba(255,255,255,0.04)', border:`1px solid ${selectedState?.id===state.id ? state.color : 'transparent'}`, borderRadius:'10px', padding:'8px 12px', cursor:'pointer', textAlign:'left', transition:'all 0.2s', color:'var(--clr-text-primary)', width:'100%' }}>
                <span style={{ fontSize:'1.2rem' }}>{state.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, fontFamily:'var(--font-heading)' }}>{state.name}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--clr-text-muted)' }}>{state.temperature} · {state.weather}</div>
                </div>
                <span style={{ fontSize:'0.75rem' }}>{state.weatherIcon}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedState && (
          <div className="map-info-box" id="selected-state-panel">
            <div className="map-info-title"><span>{selectedState.emoji}</span> {selectedState.name}</div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.8rem', color:selectedState.color, marginBottom:'4px', fontWeight:700 }}>{selectedState.tagline}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--clr-text-secondary)', lineHeight:1.6, marginBottom:'12px' }}>{selectedState.description?.substring(0, 100)}...</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                {[{label:'Temp',value:selectedState.temperature},{label:'Weather',value:selectedState.weather},{label:'Capital',value:selectedState.capital},{label:'Best Time',value:selectedState.bestTime}].map((item,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'8px' }}>
                    <div style={{ fontSize:'0.65rem', color:'var(--clr-text-muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize:'0.8rem', fontWeight:700, fontFamily:'var(--font-heading)', color:'var(--clr-text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <Link to={`/state/${selectedState.id}`} id={`explore-state-${selectedState.id}`} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'10px', display:'block', textAlign:'center' }}>
                Explore {selectedState.name} →
              </Link>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="map-info-box">
          <div className="map-info-title"><span>🏛️</span> Map Legend</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px' }}>
            {[{bg:'var(--grad-saffron)',r:'50%',lbl:'Heritage & Historic Sites'},{bg:'rgba(0,212,170,0.4)',r:'4px',lbl:'State Capitals',bd:'2px solid #00D4AA'},{bg:'#3B82F6',r:'50%',lbl:'Your Location',bd:'2px solid white'}].map((m,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'0.8rem' }}>
                <div style={{ width:16, height:16, background:m.bg, borderRadius:m.r, border:m.bd, flexShrink:0 }} />
                <span style={{ color:'var(--clr-text-secondary)' }}>{m.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
