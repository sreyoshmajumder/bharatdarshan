import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { INDIA_STATES } from '../data/indiaData';
import { ALL_INDIA_STATES } from '../data/allStates';
import { useWeather } from '../hooks/useWeather';
import { useStateNews } from '../hooks/useStateNews';
import { useHotels } from '../hooks/useHotels';
import { STATE_WIKI_QUERY, STATE_DIRECT_IMAGES } from '../data/stateImages';
import PlaceCard from '../components/PlaceCard';
import API from '../config/api';

const ALL = [...INDIA_STATES, ...ALL_INDIA_STATES];

/* ── Skeleton loader ── */
function Skeleton({ w = '100%', h = 16, r = 8, mb = 0 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, marginBottom: mb,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

/* ── Live dot ── */
function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
      borderRadius: 20, padding: '3px 10px',
      fontSize: '0.72rem', fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
      LIVE
    </span>
  );
}

export default function StatePage() {
  const { stateId }  = useParams();
  const raw          = ALL.find(s => s.id === stateId);
  const [activeTab, setActiveTab] = useState('overview');

  // Normalize fields between two data formats
  const state = raw ? {
    ...raw,
    color:       raw.color || '#FF6B2B',
    temperature: raw.temperature || raw.temp || '—',
    language:    raw.language || raw.lang || '—',
    population:  raw.population || raw.pop || '—',
    bestTime:    raw.bestTime || raw.season || '—',
    humidity:    raw.humidity || '—',
    wind:        raw.wind || '—',
    weatherIcon: raw.weatherIcon || '🌡️',
    description: raw.description || raw.economy || '',
    business:    raw.business || raw.economy || '—',
    politics:    raw.politics || '—',
    news: raw.news
      ? (Array.isArray(raw.news)
          ? raw.news.map((n, i) => typeof n === 'string'
              ? { title: n, category: 'Update', time: `${i + 1}h ago` } : n)
          : [])
      : [],
    places: raw.places || [],
  } : null;

  // ── Live data hooks ──
  const { weather: liveWeather, loading: wLoading } = useWeather(state?.capital);
  const { news: liveNews, loading: nLoading } = useStateNews(state?.name);
  const { hotels, loading: hLoading } = useHotels(state?.lat, state?.lng, state?.capital);

  // ── State background image ──
  // Use specific landmark wiki article (e.g. "Alleppey" for Kerala)
  // so we get an iconic photo instead of state map/flag.
  // Fallback chain: wiki API → curated direct URL → state color gradient.
  const [stateBg, setStateBg] = useState(
    STATE_DIRECT_IMAGES[stateId] || null  // show direct image instantly
  );
  useEffect(() => {
    if (!state?.id) return;
    const landmarkTitle = STATE_WIKI_QUERY[state.id] || state.name;
    fetch(`${API}/api/wiki/${encodeURIComponent(landmarkTitle)}`)
      .then(r => r.json())
      .then(d => {
        if (d.imageUrl) setStateBg(d.imageUrl);
        else if (STATE_DIRECT_IMAGES[state.id]) setStateBg(STATE_DIRECT_IMAGES[state.id]);
      })
      .catch(() => {
        if (STATE_DIRECT_IMAGES[state.id]) setStateBg(STATE_DIRECT_IMAGES[state.id]);
      });
  }, [state?.id]);

  // Merge: live data preferred, static fallback
  const weather = liveWeather;
  const wx = weather || {
    temperature: state?.temperature,
    feelsLike:   null,
    humidity:    state?.humidity,
    wind:        state?.wind,
    condition:   state?.weather,
    icon:        state?.weatherIcon,
  };
  const allNews = liveNews?.length > 0 ? liveNews : (state?.news || []);

  if (!state) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, paddingTop: 80 }}>
      <div style={{ fontSize: '4rem' }}>🗺️</div>
      <h2 style={{ fontFamily: 'var(--font-heading)' }}>State not found</h2>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );

  const tabs = [
    { id: 'overview', label: '📍 Overview' },
    { id: 'places',   label: '🏛️ Places'   },
    { id: 'hotels',   label: '🏨 Hotels'   },
    { id: 'news',     label: '📰 News'     },
    { id: 'business', label: '💼 Business' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#000' }}>

      {/* ── State Hero ── */}
      <div style={{
        position: 'relative',
        minHeight: 480,
        padding: '70px 0 50px',
        overflow: 'hidden',
      }}>
        {/* Background image layer */}
        {stateBg && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${stateBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.72) saturate(1.15)',
            transform: 'scale(1.03)',  /* slight zoom for Premium feel */
          }} />
        )}
        {/* If no image yet, use state-color gradient */}
        {!stateBg && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: `linear-gradient(135deg, ${state.color}30 0%, #000 100%)`,
          }} />
        )}
        {/* Dark vignette gradient on top */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: [
            'linear-gradient(to bottom,',
            '  rgba(0,0,0,0.45) 0%,',   /* top — image visible */
            '  rgba(0,0,0,0.30) 25%,',  /* mid  — max image visibility */
            '  rgba(0,0,0,0.55) 55%,',  /* lower — content readability */
            '  rgba(0,0,0,0.88) 80%,',  /* near bottom */
            '  #000000 100%',           /* tab bar flush */
            ')',
          ].join(''),
        }} />
        {/* Left-edge color glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(to right, ${state.color}22 0%, transparent 40%)`,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb */}
          <div className="state-breadcrumb" id="breadcrumb" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            <Link to="/">Home</Link><span>›</span>
            <Link to="/map">Explore</Link><span>›</span>
            <span style={{ color: state.color }}>{state.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
            {/* Emoji icon */}
            <div style={{ width: 100, height: 100, background: `${state.color}20`, border: `2px solid ${state.color}50`, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', flexShrink: 0 }}>
              {state.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${state.color}20`, border: `1px solid ${state.color}50`, borderRadius: 20, padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, color: state.color, letterSpacing: '0.08em', marginBottom: 12, backdropFilter: 'blur(8px)' }}>
                {state.region}
              </div>
              <h1 style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, marginBottom: 8,
                textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)',
                color: '#f5f5f7',
              }}>
                {state.name}
              </h1>
              <p style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: state.color, fontWeight: 700, marginBottom: 12,
                textShadow: '0 1px 8px rgba(0,0,0,0.8)',
              }}>
                {state.tagline}
              </p>
              <p style={{ color: 'rgba(245,245,247,0.8)', maxWidth: 600, lineHeight: 1.7, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
                {state.description}
              </p>
            </div>

            {/* ── Live Weather Card ── */}
            <div id="weather-card" style={{
              background: 'rgba(4,4,8,0.78)', border: `1px solid ${state.color}40`,
              borderRadius: 20, padding: '24px 28px',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              minWidth: 210, boxShadow: `0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Current Weather
                </span>
                {weather ? <LiveBadge /> : null}
              </div>

              {wLoading && !weather ? (
                <>
                  <Skeleton w="70%" h={48} r={8} mb={8} />
                  <Skeleton w="90%" h={16} r={6} mb={12} />
                  <Skeleton w="100%" h={14} r={6} mb={6} />
                  <Skeleton w="80%" h={14} r={6} mb={6} />
                </>
              ) : (
                <>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#FFD700', lineHeight: 1 }}>
                    {wx.temperature}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: '1.2rem' }}>{wx.icon}</span>
                    <span style={{ color: 'var(--clr-text-secondary)', fontSize: '0.9rem' }}>{wx.condition}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {wx.feelsLike && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--clr-text-muted)' }}>Feels Like</span>
                        <span style={{ color: 'var(--clr-text-primary)', fontWeight: 600 }}>{wx.feelsLike}</span>
                      </div>
                    )}
                    {[{ label: 'Humidity', value: wx.humidity }, { label: 'Wind', value: wx.wind }, { label: 'Best Visit', value: state.bestTime }].map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--clr-text-muted)' }}>{r.label}</span>
                        <span style={{ color: 'var(--clr-text-primary)', fontWeight: 600 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  {weather?.updatedAt && (
                    <div style={{ marginTop: 12, fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>
                      Updated {new Date(weather.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32 }} id="state-stats">
            {[
              { label: 'Capital',    value: state.capital,    icon: '🏙️' },
              { label: 'Language',   value: state.language,   icon: '💬' },
              { label: 'Population', value: state.population, icon: '👥' },
              { label: 'Best Time',  value: state.bestTime,   icon: '📅' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(4,4,8,0.72)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: '#f5f5f7' }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: 'rgba(6,11,24,0.95)', borderBottom: '1px solid var(--clr-border)', position: 'sticky', top: 70, zIndex: 100 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 8, padding: '12px 0', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? `${state.color}20` : 'transparent',
                border:     `1px solid ${activeTab === tab.id ? state.color : 'transparent'}`,
                borderRadius: 20, padding: '8px 20px',
                color:      activeTab === tab.id ? state.color : 'var(--clr-text-muted)',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="container section" id="state-content">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Top Places */}
            <div style={{ background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 16, color: state.color }}>🏛️ Top Attractions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {state.places.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)' }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: state.color, fontWeight: 600 }}>{p.type}</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setActiveTab('places')} style={{ background: 'none', border: `1px dashed ${state.color}50`, borderRadius: 10, padding: 10, color: state.color, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  View all {state.places.length} places →
                </button>
              </div>
            </div>

            {/* Latest News preview */}
            <div style={{ background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: state.color }}>📰 Latest News</h3>
                {liveNews?.length > 0 && <LiveBadge />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {nLoading && allNews.length === 0
                  ? [0,1,2].map(i => <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)' }}><Skeleton w="90%" h={14} r={6} mb={8} /><Skeleton w="50%" h={10} r={6} /></div>)
                  : allNews.slice(0, 3).map((n, i) => (
                    <a key={i} href={n.url || '#'} target="_blank" rel="noopener noreferrer" style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--clr-border)', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ background: `${state.color}15`, color: state.color, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{n.category}</span>
                        <span style={{ color: 'var(--clr-text-muted)' }}>{n.time || n.source}</span>
                      </div>
                    </a>
                  ))
                }
                <button onClick={() => setActiveTab('news')} style={{ background: 'none', border: `1px dashed ${state.color}50`, borderRadius: 10, padding: 10, color: state.color, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  View all news →
                </button>
              </div>
            </div>

            {/* Politics */}
            <div style={{ background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 12, color: state.color }}>🏛️ Political Overview</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)', lineHeight: 1.7 }}>{state.politics}</p>
            </div>

            {/* Business */}
            <div style={{ background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 12, color: state.color }}>💼 Economy &amp; Business</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)', lineHeight: 1.7 }}>{state.business}</p>
            </div>
          </div>
        )}

        {/* ── PLACES ── */}
        {activeTab === 'places' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
              Tourist Destinations in {state.name}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {state.places.map((place, i) => (
                <PlaceCard key={i} place={place} stateColor={state.color} />
              ))}
            </div>
          </div>
        )}

        {/* ── HOTELS ── */}
        {activeTab === 'hotels' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>Hotels near {state.capital}</h2>
              {!hLoading && hotels.length > 0 && (
                <span style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#22c55e' }}>
                  {hotels.length} Found
                </span>
              )}
            </div>

            {hLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} style={{ background: 'rgba(28,28,30,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24 }}>
                    <Skeleton w="60%" h={14} r={6} mb={10} />
                    <Skeleton w="40%" h={10} r={6} mb={16} />
                    <Skeleton w="100%" h={10} r={6} mb={8} />
                    <Skeleton w="80%" h={10} r={6} mb={8} />
                    <Skeleton w="50%" h={28} r={10} mb={0} />
                  </div>
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏨</div>
                <p style={{ color: 'rgba(245,245,247,0.4)' }}>No hotels found in OpenStreetMap for this area yet.</p>
                <a href={`https://www.google.com/travel/hotels/${encodeURIComponent(state.capital + ', India')}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px', background: `${state.color}20`, border: `1px solid ${state.color}50`, borderRadius: 12, color: state.color, textDecoration: 'none', fontWeight: 700 }}>
                  Search on Google Hotels →
                </a>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {hotels.map((h, i) => (
                  <div key={h.id || i} style={{
                    background: 'rgba(18,18,20,0.9)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 20,
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = state.color + '60'; e.currentTarget.style.boxShadow = `0 16px 48px ${state.color}15`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '1.1rem' }}>{h.type === 'hostel' ? '🛏️' : h.type === 'guest_house' ? '🏠' : '🏨'}</span>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: '#f5f5f7' }}>{h.name}</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(245,245,247,0.4)', textTransform: 'capitalize' }}>{h.type?.replace('_', ' ')} · {h.address}</div>
                      </div>
                      {h.stars && (
                        <div style={{ background: `${state.color}15`, border: `1px solid ${state.color}30`, borderRadius: 8, padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, color: state.color, flexShrink: 0 }}>
                          {'⭐'.repeat(Math.min(5, parseInt(h.stars) || 3))}
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, j) => (
                          <span key={j} style={{ fontSize: '0.7rem', color: j < Math.round(h.rating) ? '#FFD700' : 'rgba(255,255,255,0.15)' }}>★</span>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f5f5f7' }}>{h.rating}</span>
                    </div>

                    {/* Price */}
                    <div style={{ marginBottom: 14, padding: '10px 14px', background: `${state.color}08`, border: `1px solid ${state.color}20`, borderRadius: 12 }}>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Estimated Price</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem', color: state.color }}>
                        ₹{h.price.min.toLocaleString('en-IN')}–{h.price.max.toLocaleString('en-IN')}
                        <span style={{ fontWeight: 400, fontSize: '0.7rem', color: 'rgba(245,245,247,0.4)', marginLeft: 6 }}>{h.price.label}</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {h.amenities?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {h.amenities.map((a, j) => (
                          <span key={j} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '3px 8px', fontSize: '0.67rem', color: 'rgba(245,245,247,0.5)' }}>{a}</span>
                        ))}
                      </div>
                    )}

                    {/* Book button */}
                    <a
                      href={h.website || `https://www.google.com/travel/hotels?q=${encodeURIComponent(h.name + ' ' + state.capital)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'block', textAlign: 'center', padding: '10px', borderRadius: 12,
                        background: `${state.color}15`, border: `1px solid ${state.color}40`,
                        color: state.color, fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${state.color}25`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${state.color}15`; }}
                    >
                      {h.website ? '🔗 Visit Website' : '🏨 Book via Google Hotels'}
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 14, fontSize: '0.75rem', color: 'rgba(245,245,247,0.35)' }}>
              ℹ️ Prices are estimates. Hotel data sourced from OpenStreetMap contributors. Book directly via hotel websites for accurate rates.
            </div>
          </div>
        )}

        {/* ── NEWS ── */}
        {activeTab === 'news' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>Latest from {state.name}</h2>
              {liveNews?.length > 0 ? <LiveBadge /> : <div className="live-dot">Data</div>}
            </div>

            {nLoading && allNews.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{ background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)', borderRadius: 16, padding: '20px 24px', borderLeft: `4px solid ${state.color}` }}>
                    <Skeleton w="30%" h={12} r={6} mb={10} />
                    <Skeleton w="95%" h={16} r={6} mb={8} />
                    <Skeleton w="70%" h={12} r={6} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760 }}>
                {allNews.map((n, i) => (
                  <a key={i} id={`news-${i}`} href={n.url || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)', borderRadius: 16, overflow: 'hidden', borderLeft: `4px solid ${state.color}`, transition: 'all 0.2s', cursor: 'pointer', textDecoration: 'none', display: 'flex', gap: 0 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-bg-card)'}>
                    {/* Article image */}
                    {n.image && (
                      <div style={{ width: 120, flexShrink: 0, background: `${state.color}10` }}>
                        <img src={n.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={e => e.target.style.display = 'none'} />
                      </div>
                    )}
                    <div style={{ padding: '16px 20px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: `${state.color}15`, color: state.color, padding: '3px 10px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>{n.category}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{n.time} · {n.source}</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--clr-text-primary)', marginBottom: 6 }}>{n.title}</p>
                      {n.description && <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-secondary)', lineHeight: 1.5 }}>{n.description.slice(0, 120)}…</p>}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BUSINESS ── */}
        {activeTab === 'business' && (
          <div style={{ maxWidth: 800 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Economy &amp; Business — {state.name}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '💼', title: 'Business Overview',         body: state.business },
                { icon: '🏛️', title: 'Political Leadership',      body: state.politics },
                { icon: '📊', title: 'Investment Opportunities',  body: `${state.name} is actively seeking investors in tourism infrastructure, renewable energy, and digital transformation. Contact the state's investment bureau for detailed project profiles and incentives.` },
              ].map((card, i) => (
                <div key={i} style={{ background: i === 2 ? `${state.color}08` : 'var(--clr-bg-card)', border: `1px solid ${i === 2 ? state.color + '25' : 'var(--clr-border)'}`, borderRadius: 20, padding: 28 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: 12, color: i === 2 ? state.color : 'var(--clr-text-primary)' }}>{card.icon} {card.title}</h3>
                  <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.8 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Other States ── */}
      <div style={{ borderTop: '1px solid var(--clr-border)', padding: '48px 0 64px', background: 'var(--clr-bg-secondary)' }}>
        <div className="container">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: 'var(--clr-text-secondary)' }}>Explore More States</h3>
          <div className="places-carousel" id="other-states">
            {ALL.filter(s => s.id !== stateId).slice(0, 12).map(s => (
              <Link key={s.id} to={`/state/${s.id}`} id={`nav-to-${s.id}`} className="place-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="place-card-img" style={{ background: `linear-gradient(135deg, ${(s.color || '#FF6B2B')}20, ${(s.color || '#FF6B2B')}05)` }}>
                  {s.emoji}
                </div>
                <div className="place-card-info">
                  <div className="place-card-name">{s.name}</div>
                  <div className="place-card-type" style={{ color: s.color || '#FF6B2B' }}>{s.tagline || s.region}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
