import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ALL_INDIA_STATES } from '../data/allStates';
import { INDIA_STATES } from '../data/indiaData';
import { INDIA_HERO_IMAGES } from '../data/stateImages';

// Merge both datasets (INDIA_STATES has richer data for 6 states)
const FULL_STATES = [
  ...INDIA_STATES,
  ...ALL_INDIA_STATES,
];

const REGIONS = ['All', 'North India', 'South India', 'East India', 'West India', 'Central India', 'Northeast India', 'Island Territory'];

export default function StatesPage() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [heroBg, setHeroBg] = useState(INDIA_HERO_IMAGES.states);

  const filtered = useMemo(() => {
    return FULL_STATES.filter(s => {
      const matchQ = !query.trim() ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.capital.toLowerCase().includes(query.toLowerCase()) ||
        (s.tagline || '').toLowerCase().includes(query.toLowerCase());
      const matchR = region === 'All' || s.region === region;
      return matchQ && matchR;
    });
  }, [query, region]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#000' }}>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 60px', minHeight: 380 }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
          filter: 'brightness(0.55) saturate(1.1)',
          transform: 'scale(1.04)',
        }} />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.65) 65%, #000 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(255,107,43,0.15) 0%, transparent 50%)',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="section-label" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', background: 'rgba(255,107,43,0.15)', borderColor: 'rgba(255,107,43,0.3)' }}>🗺️ States & Union Territories</span>
          <h1 className="section-title" style={{ marginTop: 12, textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)', color: '#f5f5f7' }}>
            Explore All of <span className="gradient-text">Incredible India</span>
          </h1>
          <p style={{ color: 'rgba(245,245,247,0.75)', maxWidth: 580, lineHeight: 1.7, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
            28 states and 8 union territories — each with unique culture, climate, economy, politics, tourism,
            heritage and cuisine. Find your next destination.
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { v: '28', l: 'States' }, { v: '8', l: 'Union Territories' },
              { v: '1,600+', l: 'Heritage Sites' }, { v: '22+', l: 'Official Languages' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(4,4,8,0.7)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, padding: '12px 20px', backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--clr-saffron)' }}>{s.v}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', letterSpacing: '0.06em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        position: 'sticky', top: 70, zIndex: 100,
        background: 'rgba(6,11,24,0.95)', borderBottom: '1px solid var(--clr-border)',
        backdropFilter: 'blur(20px)', padding: '14px 0',
      }}>
        <div className="container" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <input
            id="states-search"
            className="map-search"
            style={{ maxWidth: 260 }}
            placeholder="🔍  Search states..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {/* Region filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {REGIONS.map(r => (
              <button key={r} id={`region-${r.replace(/\s/g, '-')}`}
                onClick={() => setRegion(r)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: region === r ? 'var(--clr-saffron)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${region === r ? 'var(--clr-saffron)' : 'var(--clr-border)'}`,
                  color: region === r ? 'white' : 'var(--clr-text-secondary)',
                }}>
                {r}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            {[{ v: 'grid', icon: '⊞' }, { v: 'list', icon: '☰' }].map(({ v, icon }) => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: view === v ? 'var(--clr-saffron)' : 'transparent',
                  color: view === v ? 'white' : 'var(--clr-text-muted)', fontSize: '1rem',
                }}>
                {icon}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginLeft: 'auto' }}>
            {filtered.length} results
          </span>
        </div>
      </div>

      {/* States */}
      <div className="container" style={{ padding: '40px var(--space-xl)' }}>
        {view === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(state => (
              <StateCard key={state.id} state={state} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(state => (
              <StateListRow key={state.id} state={state} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <p style={{ color: 'var(--clr-text-muted)' }}>No states match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StateCard({ state }) {
  const color = state.color || '#FF6B2B';
  const temp = state.temperature || state.temp || '—';
  const weather = state.weather || '—';
  const season = state.bestTime || state.season || '—';
  const places = state.places || [];

  return (
    <Link
      to={`/state/${state.id}`}
      id={`state-card-link-${state.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div style={{
        background: 'var(--clr-bg-card)',
        border: '1px solid var(--clr-border)',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        height: '100%',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 40px ${color}25`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--clr-border)';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${color}18, ${color}06)`,
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${color}20`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `${color}20`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', flexShrink: 0,
          }}>{state.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem' }}>
              {state.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
              {state.region} · {state.capital}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color }}>
              {temp}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>{weather}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>
          {state.tagline && (
            <p style={{ fontSize: '0.78rem', color, fontWeight: 700, marginBottom: 8 }}>
              {state.tagline}
            </p>
          )}

          {/* Quick info row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              { icon: '💬', val: state.language || state.lang },
              { icon: '👥', val: state.population || state.pop },
              { icon: '📅', val: season },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{item.icon}</span>
                <span>{item.val}</span>
              </div>
            ))}
          </div>

          {/* Top places */}
          {places.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-text-muted)', marginBottom: 8 }}>
                Top Attractions
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {places.slice(0, 3).map((p, i) => (
                  <span key={i} style={{
                    background: `${color}12`, border: `1px solid ${color}25`,
                    color, padding: '3px 10px', borderRadius: 20,
                    fontSize: '0.72rem', fontWeight: 600,
                  }}>
                    {p.emoji} {p.name}
                  </span>
                ))}
                {places.length > 3 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', alignSelf: 'center' }}>
                    +{places.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Economy snippet */}
          {state.economy && (
            <p style={{
              fontSize: '0.75rem', color: 'var(--clr-text-muted)', lineHeight: 1.5,
              marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--clr-border)',
            }}>
              💼 {state.economy.substring(0, 90)}{state.economy.length > 90 ? '...' : ''}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--clr-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color, letterSpacing: '0.05em' }}>
            {state.gdp || ''}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
            Explore → 
          </span>
        </div>
      </div>
    </Link>
  );
}

function StateListRow({ state }) {
  const color = state.color || '#FF6B2B';
  const temp = state.temperature || state.temp || '—';
  const places = state.places || [];

  return (
    <Link to={`/state/${state.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--clr-bg-card)', border: '1px solid var(--clr-border)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}08`; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--clr-border)'; e.currentTarget.style.background = 'var(--clr-bg-card)'; }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
        }}>{state.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>
            {state.name}
            <span style={{ color, fontSize: '0.75rem', fontWeight: 600, marginLeft: 8 }}>
              {state.tagline && `· ${state.tagline}`}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
            {state.capital} · {state.region} · {state.language || state.lang}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 300 }}>
          {places.slice(0, 2).map((p, i) => (
            <span key={i} style={{
              background: `${color}10`, color, padding: '2px 8px',
              borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
            }}>{p.emoji} {p.name}</span>
          ))}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color, fontSize: '1rem' }}>{temp}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>{state.weather || '—'}</div>
        </div>
        <span style={{ color: 'var(--clr-text-muted)', fontSize: '1rem' }}>→</span>
      </div>
    </Link>
  );
}
