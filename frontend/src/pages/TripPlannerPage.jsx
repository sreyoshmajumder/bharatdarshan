import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { INDIA_STATES } from '../data/indiaData';
import { ALL_INDIA_STATES } from '../data/allStates';

const ALL_STATES = [...INDIA_STATES, ...ALL_INDIA_STATES];

const STYLES = [
  { id: 'cultural',   icon: '🏛️', label: 'Cultural',   desc: 'Forts, temples & heritage' },
  { id: 'adventure',  icon: '🏔️', label: 'Adventure',  desc: 'Treks, wildlife & thrills' },
  { id: 'relaxation', icon: '🌊', label: 'Relaxation',  desc: 'Beaches, hills & spas' },
  { id: 'family',     icon: '👨‍👩‍👧', label: 'Family',     desc: 'Kid-friendly activities' },
  { id: 'romance',    icon: '💕', label: 'Romance',     desc: 'Scenic & intimate stays' },
  { id: 'mixed',      icon: '🗺️', label: 'Explorer',   desc: 'Best of everything' },
];

const BUDGETS = [
  { id: 'budget',  label: 'Budget',      amount: 1500,  desc: '₹500–2,000/day',   icon: '🎒' },
  { id: 'mid',     label: 'Comfortable', amount: 5000,  desc: '₹3,000–8,000/day', icon: '🏨' },
  { id: 'luxury',  label: 'Luxury',      amount: 18000, desc: '₹12,000+/day',    icon: '👑' },
];

const RESTAURANTS = {
  rajasthan:['Laxmi Misthan Bhandar, Jaipur','The Spice Court, Jaipur','Jharokha, Jodhpur'],
  kerala:['Paragon Restaurant, Kozhikode','Grand Hotel Restaurant, Trivandrum','Dhe Puttu, Kochi'],
  maharashtra:['Trishna, Mumbai','Indigo Deli, Mumbai','SodaBottleOpenerWala, Mumbai'],
  default:['Local Dhaba','Heritage Restaurant','Rooftop Café'],
};

const EVENINGS = [
  'Aarti at the riverbank at sunset',
  'Sound & Light Show at the main fort',
  'Local bazaar walk & street food trail',
  'Cultural folk dance performance',
  'Rooftop dinner with city panorama',
  'Sunset cruise / boat ride',
];

const TRANSPORTS = {
  budget:  ['Auto-rickshaw (₹50–150)', 'City bus (₹10–50)', 'Shared taxi'],
  mid:     ['Cab via OLA/Uber', 'Tempo traveller for groups', 'E-rickshaw'],
  luxury:  ['Private car & driver', 'Luxury coach', 'Helicopter transfers (select)'],
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildPlan(stateData, days, budget, styleId) {
  if (!stateData) return [];
  const raw = stateData.places || [];
  const heritage = raw.filter(p => ['Heritage','Monument','Fort','Palace','Memorial','Spiritual','Temple'].includes(p.type));
  const nature   = raw.filter(p => ['Nature','Wildlife','Beach','Hill Station','Adventure','Waterfall'].includes(p.type));
  const urban    = raw.filter(p => !heritage.includes(p) && !nature.includes(p));

  const picks = (primary, secondary, tertiary, n) =>
    [...primary, ...secondary, ...tertiary].slice(0, n);

  const plans = [
    {
      id: 'cultural', title: 'Heritage & Culture Trail', theme: 'Cultural Immersion',
      icon: '🏛️', color: '#FF6B2B', costMult: 1.0,
      bestFor: 'History lovers · Photography · Heritage walks',
      list: picks(heritage, urban, nature, days * 2),
    },
    {
      id: 'adventure', title: 'Nature & Adventure Circuit', theme: 'Adventure & Exploration',
      icon: '🌿', color: '#00D4AA', costMult: 1.15,
      bestFor: 'Adventure seekers · Nature enthusiasts · Families',
      list: picks(nature, heritage, urban, days * 2),
    },
    {
      id: 'balanced', title: 'Complete Discovery Route', theme: 'Best of All Worlds',
      icon: '✨', color: '#8B5CF6', costMult: 1.07,
      bestFor: 'Couples · First-time visitors · All budgets',
      list: shuffle([...heritage.slice(0, Math.ceil(days)), ...nature.slice(0, Math.floor(days))]).slice(0, days * 2),
    },
  ];

  const transport = TRANSPORTS[budget.id] || TRANSPORTS.mid;
  const restaurants = RESTAURANTS[stateData.id] || RESTAURANTS.default;
  const capital = stateData.capital;

  return plans.map(plan => {
    let pi = 0;
    const daysList = Array.from({ length: days }, (_, i) => {
      const morning   = plan.list[pi++] || null;
      const afternoon = plan.list[pi++] || null;
      const dayBudget = budget.amount;
      return {
        day: i + 1,
        title: i === 0 ? `Arrival in ${capital}` : i === days - 1 ? `Farewell & Departure` : `Day ${i + 1}`,
        morning: {
          time: '9:00 AM', duration: '3 hrs',
          activity: morning ? `Explore ${morning.name}` : `Morning walk in ${capital}`,
          place: morning?.name || capital,
          cost: Math.round(dayBudget * 0.18),
          tip: morning?.desc ? morning.desc.slice(0, 80) + '…' : '',
        },
        afternoon: {
          time: '1:00 PM', duration: '3 hrs',
          activity: afternoon ? `Visit ${afternoon.name}` : `Local market & cuisine hunt`,
          place: afternoon?.name || 'Local Market',
          cost: Math.round(dayBudget * 0.12),
          tip: afternoon?.desc ? afternoon.desc.slice(0, 80) + '…' : '',
        },
        evening: {
          time: '6:30 PM', duration: '2 hrs',
          activity: EVENINGS[(i + plan.list.length) % EVENINGS.length],
          place: capital,
          cost: Math.round(dayBudget * 0.08),
        },
        restaurant: restaurants[i % restaurants.length],
        transport:  transport[i % transport.length],
        stay:       budget.id === 'luxury' ? 'Luxury Heritage Hotel' : budget.id === 'mid' ? '3-star Hotel' : 'Budget Guesthouse/Hostel',
        dayCost:    dayBudget,
      };
    });

    return {
      ...plan,
      days: daysList,
      totalCost: Math.round(budget.amount * days * plan.costMult),
    };
  });
}

// ── Input component helpers ──
function Label({ children }) {
  return <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,245,247,0.45)', marginBottom: 10 }}>{children}</div>;
}

function PillBtn({ active, color = '#FF6B2B', onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 18px', borderRadius: 24, cursor: 'pointer', transition: 'all 0.2s',
      background: active ? `${color}25` : 'rgba(255,255,255,0.06)',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
      color: active ? color : 'rgba(245,245,247,0.6)',
      fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

// ── Plan card ──
function PlanCard({ plan, days, selected, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div onClick={() => { onSelect(); setExpanded(true); }} style={{
      background: selected ? `${plan.color}12` : 'rgba(28,28,30,0.85)',
      border: `1px solid ${selected ? plan.color : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 22, padding: '28px 28px 24px', cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      transform: selected ? 'scale(1.02)' : 'scale(1)',
      boxShadow: selected ? `0 20px 60px ${plan.color}25` : '0 4px 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: `${plan.color}20`, border: `1px solid ${plan.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
        }}>{plan.icon}</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Est. Total</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.3rem', color: plan.color }}>
            ₹{plan.totalCost.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: plan.color, marginBottom: 6 }}>
        {plan.theme}
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', marginBottom: 8, color: '#f5f5f7' }}>{plan.title}</h3>
      <p style={{ fontSize: '0.78rem', color: 'rgba(245,245,247,0.55)', marginBottom: 16, lineHeight: 1.6 }}>
        Best for: {plan.bestFor}
      </p>

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {plan.days.slice(0, 4).map((d, i) => (
          <span key={i} style={{
            background: `${plan.color}15`, border: `1px solid ${plan.color}30`,
            color: plan.color, padding: '4px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
          }}>Day {d.day}</span>
        ))}
        {days > 4 && <span style={{ color: 'rgba(245,245,247,0.3)', fontSize: '0.7rem', alignSelf: 'center' }}>+{days - 4} more</span>}
      </div>

      <div style={{
        padding: '10px 14px', borderRadius: 12,
        background: selected ? `${plan.color}10` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${selected ? plan.color + '30' : 'rgba(255,255,255,0.07)'}`,
        fontSize: '0.78rem', fontWeight: 700, color: plan.color,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{selected ? '✓ Selected — scroll down' : 'Select this plan'}</span>
        <span style={{ fontSize: '1rem' }}>{selected ? '↓' : '→'}</span>
      </div>
    </div>
  );
}

// ── Full itinerary view ──
function Itinerary({ plan, startDate, stateData }) {
  const [activeDay, setActiveDay] = useState(0);
  const day = plan.days[activeDay];

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: plan.color, marginBottom: 6 }}>Full Itinerary</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', color: '#f5f5f7' }}>{plan.title}</h2>
        </div>
        <div style={{
          background: `${plan.color}15`, border: `1px solid ${plan.color}40`, borderRadius: 16,
          padding: '12px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(245,245,247,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total Estimated Cost</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.6rem', color: plan.color }}>
            ₹{plan.totalCost.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, marginBottom: 28 }}>
        {plan.days.map((d, i) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          return (
            <button key={i} onClick={() => setActiveDay(i)} style={{
              flexShrink: 0, padding: '12px 20px', borderRadius: 16, cursor: 'pointer',
              background: activeDay === i ? `${plan.color}22` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeDay === i ? plan.color : 'rgba(255,255,255,0.08)'}`,
              color: activeDay === i ? plan.color : 'rgba(245,245,247,0.5)',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Day {d.day}</div>
              <div style={{ fontSize: '0.65rem', marginTop: 2, opacity: 0.7 }}>{fmtDate(date)}</div>
            </button>
          );
        })}
      </div>

      {/* Day detail card */}
      <div style={{
        background: 'rgba(28,28,30,0.85)', backdropFilter: 'blur(30px)',
        border: `1px solid ${plan.color}25`, borderRadius: 24, overflow: 'hidden',
        boxShadow: `0 24px 80px ${plan.color}15`,
      }}>
        {/* Day header */}
        <div style={{
          background: `linear-gradient(135deg, ${plan.color}18, transparent)`,
          padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: plan.color, marginBottom: 4 }}>Day {day.day}</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: '#f5f5f7', margin: 0 }}>{day.title}</h3>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { icon: '💰', label: 'Day Budget', val: `₹${day.dayCost.toLocaleString('en-IN')}` },
              { icon: '🚗', label: 'Transport', val: day.transport },
              { icon: '🛏️', label: 'Stay', val: day.stay },
            ].map((m, i) => (
              <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 14px', minWidth: 100 }}>
                <div style={{ fontSize: '1rem', marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f5f5f7', marginTop: 2 }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: '28px' }}>
          {[
            { slot: day.morning, bg: '#FF6B2B', icon: '☀️', label: 'Morning' },
            { slot: day.afternoon, bg: '#00D4AA', icon: '🌤️', label: 'Afternoon' },
            { slot: day.evening, bg: '#8B5CF6', icon: '🌙', label: 'Evening' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, marginBottom: i < 2 ? 28 : 0 }}>
              {/* Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: `${s.bg}22`, border: `1px solid ${s.bg}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
                }}>{s.icon}</div>
                {i < 2 && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.06)', minHeight: 28, marginTop: 8 }} />}
              </div>

              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: s.bg }}>{s.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(245,245,247,0.4)', marginLeft: 10 }}>{s.slot.time} · {s.slot.duration}</span>
                  </div>
                  {s.slot.cost && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f5f5f7', background: 'rgba(255,255,255,0.07)', padding: '2px 10px', borderRadius: 8 }}>
                      ~₹{s.slot.cost}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: '#f5f5f7', marginBottom: 4 }}>{s.slot.activity}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(245,245,247,0.45)', fontStyle: 'italic' }}>{s.slot.place}</div>
                {s.slot.tip && <div style={{ fontSize: '0.72rem', color: 'rgba(245,245,247,0.35)', marginTop: 6, lineHeight: 1.5 }}>💡 {s.slot.tip}</div>}
              </div>
            </div>
          ))}

          {/* Restaurant row */}
          <div style={{
            marginTop: 24, padding: '14px 18px', borderRadius: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', gap: 20, flexWrap: 'wrap',
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase' }}>🍽 Recommended Restaurant</span>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f5f5f7', marginTop: 4 }}>{day.restaurant}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Day nav */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={() => setActiveDay(d => Math.max(0, d - 1))} disabled={activeDay === 0} style={{
          flex: 1, padding: 14, borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(245,245,247,0.6)', fontFamily: 'inherit',
          fontWeight: 700, opacity: activeDay === 0 ? 0.4 : 1,
        }}>← Previous Day</button>
        <button onClick={() => setActiveDay(d => Math.min(plan.days.length - 1, d + 1))} disabled={activeDay === plan.days.length - 1} style={{
          flex: 1, padding: 14, borderRadius: 14, cursor: 'pointer',
          background: `${plan.color}15`, border: `1px solid ${plan.color}40`,
          color: plan.color, fontFamily: 'inherit', fontWeight: 700,
          opacity: activeDay === plan.days.length - 1 ? 0.4 : 1,
        }}>Next Day →</button>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function TripPlannerPage() {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [stateId, setStateId]   = useState('rajasthan');
  const [startDate, setStart]   = useState(today);
  const [endDate, setEnd]       = useState(nextWeek);
  const [budgetId, setBudget]   = useState('mid');
  const [styleId, setStyle]     = useState('mixed');
  const [travelers, setTravelers] = useState(2);
  const [plans, setPlans]       = useState(null);
  const [selectedPlan, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const stateData = ALL_STATES.find(s => s.id === stateId);
  const days      = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000));
  const budget    = BUDGETS.find(b => b.id === budgetId) || BUDGETS[1];

  const handleGenerate = () => {
    setLoading(true);
    setPlans(null);
    setSelected(null);
    setTimeout(() => {
      const result = buildPlan(stateData, days, budget, styleId);
      setPlans(result);
      setLoading(false);
    }, 1600);
  };

  const inp = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '13px 16px', color: '#f5f5f7',
    fontFamily: 'inherit', fontSize: '0.9rem', width: '100%',
    outline: 'none', appearance: 'none', colorScheme: 'dark',
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 70, background: '#000' }}>
      {/* ── Hero ── */}
      <div style={{
        position: 'relative', padding: '80px 0 64px', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,43,0.12) 0%, transparent 70%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.25)',
            borderRadius: 24, padding: '6px 18px', fontSize: '0.7rem', fontWeight: 700,
            color: '#FF6B2B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24,
          }}>✈️ AI-Powered Trip Planner</div>

          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 900,
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: 20,
            background: 'linear-gradient(135deg, #f5f5f7 0%, rgba(245,245,247,0.6) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Plan Your Perfect<br />
            <span style={{
              background: 'linear-gradient(135deg, #FF6B2B, #FFD700)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>India Journey</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'rgba(245,245,247,0.5)', maxWidth: 520, margin: '0 auto 0' }}>
            Tell us where, when, and how — we'll craft 3 expert-curated routes with day-by-day itineraries, places to visit, and where to eat.
          </p>
        </div>
      </div>

      {/* ── Planner Form ── */}
      <div className="container" style={{ maxWidth: 900, paddingBottom: 80 }}>
        <div style={{
          background: 'rgba(18,18,20,0.9)', backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 28,
          padding: '40px 44px', marginBottom: 48,
          boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 28 }}>
            {/* Destination */}
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>🗺️ Destination State</Label>
              <select value={stateId} onChange={e => setStateId(e.target.value)} style={inp} id="trip-destination">
                {ALL_STATES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div>
              <Label>📅 From Date</Label>
              <input id="trip-start-date" type="date" value={startDate} onChange={e => setStart(e.target.value)} style={inp} min={today} />
            </div>
            <div>
              <Label>📅 To Date</Label>
              <input id="trip-end-date" type="date" value={endDate} onChange={e => setEnd(e.target.value)} style={inp} min={startDate} />
            </div>

            {/* Travelers */}
            <div>
              <Label>👥 Travelers: {travelers}</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5,6].map(n => (
                  <button key={n} onClick={() => setTravelers(n)} style={{
                    width: 40, height: 40, borderRadius: 12, border: `1px solid ${travelers === n ? '#FF6B2B' : 'rgba(255,255,255,0.1)'}`,
                    background: travelers === n ? 'rgba(255,107,43,0.2)' : 'rgba(255,255,255,0.05)',
                    color: travelers === n ? '#FF6B2B' : 'rgba(245,245,247,0.5)',
                    fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
                  }}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 28 }}>
            <Label>💰 Budget per Day</Label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {BUDGETS.map(b => (
                <button key={b.id} id={`budget-${b.id}`} onClick={() => setBudget(b.id)} style={{
                  flex: 1, minWidth: 140, padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
                  background: budgetId === b.id ? 'rgba(255,107,43,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${budgetId === b.id ? '#FF6B2B' : 'rgba(255,255,255,0.1)'}`,
                  transition: 'all 0.2s', fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{b.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: budgetId === b.id ? '#FF6B2B' : '#f5f5f7', marginBottom: 2 }}>{b.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(245,245,247,0.4)' }}>{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div style={{ marginBottom: 36 }}>
            <Label>🎭 Travel Style</Label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {STYLES.map(s => (
                <button key={s.id} id={`style-${s.id}`} onClick={() => setStyle(s.id)} style={{
                  padding: '10px 16px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                  background: styleId === s.id ? 'rgba(255,107,43,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${styleId === s.id ? '#FF6B2B' : 'rgba(255,255,255,0.1)'}`,
                  fontFamily: 'inherit', textAlign: 'left',
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: styleId === s.id ? '#FF6B2B' : '#f5f5f7' }}>{s.label}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(245,245,247,0.4)', marginTop: 2 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Trip summary */}
          {stateData && (
            <div style={{
              background: 'rgba(255,107,43,0.07)', border: '1px solid rgba(255,107,43,0.2)',
              borderRadius: 16, padding: '14px 20px', marginBottom: 28, display: 'flex', gap: 24, flexWrap: 'wrap',
            }}>
              {[
                { label: 'Destination', val: `${stateData.emoji} ${stateData.name}` },
                { label: 'Duration', val: `${days} Day${days !== 1 ? 's' : ''}` },
                { label: 'Travelers', val: `${travelers} Person${travelers !== 1 ? 's' : ''}` },
                { label: 'Est. Budget', val: `₹${(budget.amount * days * travelers).toLocaleString('en-IN')} total` },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(245,245,247,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FF6B2B' }}>{item.val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Generate button */}
          <button id="generate-trip-btn" onClick={handleGenerate} disabled={loading} style={{
            width: '100%', padding: '18px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: loading ? 'rgba(255,107,43,0.4)' : 'linear-gradient(135deg, #FF6B2B, #FF8C4A)',
            color: '#fff', fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem',
            letterSpacing: '0.04em', transition: 'all 0.3s',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(255,107,43,0.35)',
          }}>
            {loading ? '⏳ Crafting Your Perfect Journey...' : `✨ Generate ${days}-Day Itinerary for ${stateData?.name || 'India'}`}
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'spin 2s linear infinite', display: 'inline-block' }}>🗺️</div>
            <p style={{ color: 'rgba(245,245,247,0.5)', fontSize: '1rem' }}>Curating the best experiences in {stateData?.name}…</p>
          </div>
        )}

        {/* ── Plan results ── */}
        {plans && !loading && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,245,247,0.4)', marginBottom: 12 }}>
                Choose Your Route
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.8rem', color: '#f5f5f7' }}>
                3 Curated Plans for {stateData?.name}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 48 }}>
              {plans.map(plan => (
                <PlanCard
                  key={plan.id} plan={plan} days={days}
                  selected={selectedPlan?.id === plan.id}
                  onSelect={() => setSelected(plan)}
                />
              ))}
            </div>

            {/* Full itinerary */}
            {selectedPlan && (
              <Itinerary plan={selectedPlan} startDate={startDate} stateData={stateData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
