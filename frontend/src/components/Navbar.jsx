import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/',             label: 'Home',        icon: '⬡' },
  { to: '/map',          label: 'Live Map',    icon: '🗺️' },
  { to: '/states',       label: 'States',      icon: '🏛️' },
  { to: '/nearby',       label: 'Nearby',      icon: '📍' },
  { to: '/trip-planner', label: 'Plan Trip',   icon: '✈️', accent: true },
  { to: '/scan',         label: 'Scanner',     icon: '📷' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const isActive = (p) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
      height: 64,
      background: scrolled
        ? 'rgba(0,0,0,0.85)'
        : 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', height: '100%',
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 32px',
      }}>
        {/* Logo */}
        <Link to="/" id="nav-logo" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', marginRight: 'auto', flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #FF6B2B, #FF8C4A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 4px 16px rgba(255,107,43,0.35)',
          }}>🗺️</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem',
              color: '#f5f5f7', letterSpacing: '-0.02em',
            }}>BharatDarshan</div>
            <div style={{
              fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(245,245,247,0.35)',
              lineHeight: 1,
            }}>Discover Incredible India</div>
          </div>
        </Link>

        {/* Desktop links */}
        <ul style={{
          display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0,
          alignItems: 'center',
        }} id="nav-links">
          {NAV_LINKS.map(link => {
            const active = isActive(link.to);
            return (
              <li key={link.to}>
                <Link to={link.to} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 10, textDecoration: 'none',
                  fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                  color: link.accent
                    ? '#FF6B2B'
                    : active ? '#f5f5f7' : 'rgba(245,245,247,0.55)',
                  background: link.accent
                    ? 'rgba(255,107,43,0.12)'
                    : active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: link.accent
                    ? '1px solid rgba(255,107,43,0.25)'
                    : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    if (!link.accent) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = '#f5f5f7';
                  }}
                  onMouseLeave={e => {
                    if (!link.accent) e.currentTarget.style.background = active ? 'rgba(255,255,255,0.06)' : 'transparent';
                    e.currentTarget.style.color = link.accent ? '#FF6B2B' : active ? '#f5f5f7' : 'rgba(245,245,247,0.55)';
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Auth actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
          {user ? (
            <>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', color: 'rgba(245,245,247,0.6)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34c759', display: 'inline-block', boxShadow: '0 0 6px #34c759' }} />
                {user.name}
              </span>
              <button id="nav-logout" onClick={logout} style={{
                padding: '7px 16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(245,245,247,0.7)', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link id="nav-login" to="/login" style={{
                padding: '7px 16px', borderRadius: 10, textDecoration: 'none',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(245,245,247,0.7)', fontWeight: 600, fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}>Sign In</Link>
              <Link id="nav-signup" to="/signup" style={{
                padding: '7px 16px', borderRadius: 10, textDecoration: 'none',
                background: 'linear-gradient(135deg, #FF6B2B, #FF8C4A)',
                color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                boxShadow: '0 4px 14px rgba(255,107,43,0.3)',
                transition: 'all 0.2s',
              }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
