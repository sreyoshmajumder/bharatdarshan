import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { INDIA_STATES } from '../data/indiaData';

/* ── Monument Slideshow Data ── */
const MONUMENTS = [
  {
    src: '/monument_taj_mahal.png',
    name: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
  },
  {
    src: '/monument_red_fort.png',
    name: 'Red Fort',
    location: 'Delhi',
  },
  {
    src: '/monument_hampi.png',
    name: 'Hampi Ruins',
    location: 'Karnataka',
  },
  {
    src: '/monument_hawa_mahal.png',
    name: 'Hawa Mahal',
    location: 'Jaipur, Rajasthan',
  },
  {
    src: '/monument_konark.png',
    name: 'Konark Sun Temple',
    location: 'Odisha',
  },
];

/* ── Monument Hero Slideshow ── */
function MonumentSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setTransitioning(true);
      const next = (current + 1) % MONUMENTS.length;
      setCurrent(next);
      setTimeout(() => {
        setPrev(null);
        setTransitioning(false);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  const goTo = (idx) => {
    if (idx === current || transitioning) return;
    setPrev(current);
    setTransitioning(true);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setTransitioning(false); }, 1200);
  };

  return (
    <div className="hero-slideshow" aria-hidden>
      {/* Prev slide fading out */}
      {prev !== null && (
        <div
          className="hero-slide hero-slide-exit"
          style={{ backgroundImage: `url(${MONUMENTS[prev].src})` }}
        />
      )}
      {/* Current slide */}
      <div
        className={`hero-slide hero-slide-enter ${transitioning ? 'hero-slide-entering' : 'hero-slide-active'}`}
        style={{ backgroundImage: `url(${MONUMENTS[current].src})` }}
      />
      {/* Dark overlay for text readability */}
      <div className="hero-slide-overlay" />

      {/* Monument label */}
      <div className="hero-monument-label">
        <span className="hero-monument-dot" />
        <span>{MONUMENTS[current].name}</span>
        <span className="hero-monument-sep">·</span>
        <span>{MONUMENTS[current].location}</span>
      </div>

      {/* Slide dots */}
      <div className="hero-slide-dots">
        {MONUMENTS.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Animated Counter ── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1800;
        const step = (target / duration) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Scroll Reveal Hook ── */
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

export default function HomePage() {
  useScrollReveal();

  const features = [
    { icon: '🗺️', color: 'saffron', title: 'Interactive Live Map', desc: 'Real-time satellite map of India with street-level details, state boundaries, and live location tracking.' },
    { icon: '📍', color: 'teal', title: 'Heritage Notifications', desc: 'Get automatic alerts when you pass near a historical landmark with its rich story and significance.' },
    { icon: '📷', color: 'gold', title: 'AI Visual Scanner', desc: 'Point your camera at anything — monuments, signs, food — and get instant AI-powered insights.' },
    { icon: '🌤️', color: 'blue', title: 'Live Weather Data', desc: 'Real-time temperature, humidity, wind speed, and forecasts for any state or city in India.' },
    { icon: '📰', color: 'purple', title: 'State News & Alerts', desc: 'Curated live news feeds covering tourism, floods, politics, business, and safety per region.' },
    { icon: '🏛️', color: 'red', title: 'Tourism Intelligence', desc: 'AI-curated itineraries, best-season guides, budget tips, and insider knowledge for every Indian state.' },
  ];

  const services = [
    {
      badge: 'saffron',
      badgeText: '🗺️  Live Maps',
      title: 'Intelligent Navigation & Discovery',
      desc: 'Our next-gen mapping engine goes beyond navigation. Explore India at every level — from satellite imagery to street-level views, with curated overlays of tourist spots, holy sites, and hidden gems.',
      features: ['Real-time GPS tracking', 'Offline map downloads', 'Heritage site proximity alerts', 'Safe route recommendations'],
      featured: true,
    },
    {
      badge: 'teal',
      badgeText: '📷  Scanner',
      title: 'AI-Powered Visual Recognition',
      desc: 'Point, scan, and discover. Our camera-based AI identifies monuments, cuisine, scripts, and art forms — then narrates their cultural significance in seconds.',
      features: ['Monument identification', 'Multilingual OCR', 'Cuisine recognition', 'Art & artifact analysis'],
      featured: false,
    },
    {
      badge: 'gold',
      badgeText: '⚡  Live Data',
      title: 'Real-Time India Intelligence',
      desc: 'Always know what\'s happening where you\'re travelling. From flood alerts and political events to business expos and cultural festivals — we keep you informed.',
      features: ['Weather & disaster alerts', 'Political situation map', 'Business & startup Radar', 'Festival calendar & guides'],
      featured: false,
    },
    {
      badge: 'purple',
      badgeText: '🏛️  Tourism AI',
      title: 'Personalised Travel Companion',
      desc: 'Your AI travel expert that learns your preferences and crafts bespoke Indian journeys. From Himalayan treks to backwater cruises — every trip tailored to you.',
      features: ['Smart itinerary builder', 'Budget & expense planner', 'Local guide connect', 'Review & recomm engine'],
      featured: false,
    },
  ];

  const benefits = [
    { icon: '🛡️', title: 'Travel Safely', desc: 'Real-time safety alerts, flood warnings, and emergency services locator keep you protected anywhere in India.' },
    { icon: '🌐', title: 'Language-Inclusive', desc: 'Works in 22+ Indian languages. Communicate seamlessly even in remote villages or tribal regions.' },
    { icon: '💡', title: 'Deep Cultural Insights', desc: 'Go beyond guidebooks. Understand local customs, festivals, food traditions, and unwritten rules informed by AI.' },
    { icon: '⚡', title: 'Instant Answers', desc: 'Ask anything about a place, and get contextual, verified information from curated databases in seconds.' },
    { icon: '📴', title: 'Offline Capable', desc: 'Core maps and state data work without internet — perfect for remote mountain regions and dense forests.' },
    { icon: '🤝', title: 'Community-Powered', desc: 'Millions of verified traveller reviews, tips, and real-time photos make every destination feel familiar.' },
  ];

  const visionPillars = [
    { icon: '🌏', title: 'Digital India', desc: 'Bridging tech & tourism' },
    { icon: '🏛️', title: 'Heritage First', desc: 'Preserving our stories' },
    { icon: '🤖', title: 'AI-Driven', desc: 'Intelligent guidance' },
    { icon: '🌿', title: 'Sustainable', desc: 'Responsible travel' },
    { icon: '🤝', title: 'Inclusive', desc: 'For every Indian' },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero hero-cinematic" id="home">
        {/* Background slideshow */}
        <MonumentSlideshow />

        {/* Content */}
        <div className="hero-cinematic-content">
          {/* Badge */}
          <div className="hero-badge-v2" id="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Travel Intelligence
          </div>

          {/* Headline */}
          <h1 className="hero-title-v2" id="hero-title">
            Discover <span className="hero-title-highlight">Bharat</span>
            <br />
            Like Never Before
          </h1>

          {/* Description */}
          <p className="hero-description-v2" id="hero-desc">
            Your intelligent companion for exploring India — real-time
            location insights, historic landmark notifications, live weather,
            news, and an AI-powered visual scanner at your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="hero-actions-v2" id="hero-actions">
            <Link to="/map" className="hero-btn-primary" id="hero-explore-btn">
              Start Exploring →
            </Link>
            <Link to="/scan" className="hero-btn-secondary" id="hero-scan-btn">
              <span className="hero-btn-icon">📷</span> Scan &amp; Discover
            </Link>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="hero-stats-bar" id="hero-stats">
          <div className="hero-stat-item" id="hero-stat-0">
            <span className="hero-stat-icon">📍</span>
            <span className="hero-stat-number">28+</span>
            <span className="hero-stat-label">States Covered</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-item" id="hero-stat-1">
            <span className="hero-stat-icon">🔔</span>
            <span className="hero-stat-number">10K+</span>
            <span className="hero-stat-label">Landmark Alerts</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat-item" id="hero-stat-2">
            <span className="hero-stat-icon">📷</span>
            <span className="hero-stat-number">50K+</span>
            <span className="hero-stat-label">Scan Queries</span>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker-wrapper" id="ticker">
        <div className="ticker-track">
          {['🕌 Explore 28 States', '⛰️ Himalayan Treks', '🌴 Beach Paradises', '🏰 Royal Forts', '🛕 Sacred Temples',
            '🏖️ Coastal Wonders', '🗺️ Live Navigation', '📷 AI Scanner', '🌤️ Live Weather', '📰 State News',
            '🕌 Explore 28 States', '⛰️ Himalayan Treks', '🌴 Beach Paradises', '🏰 Royal Forts', '🛕 Sacred Temples',
            '🏖️ Coastal Wonders', '🗺️ Live Navigation', '📷 AI Scanner', '🌤️ Live Weather', '📰 State News'].map((t, i) => (
            <span key={i} className="ticker-item">{t} &nbsp; ✦</span>
          ))}
        </div>
      </div>

      {/* ── Features Section ── */}
      <section className="section" id="features">
        <div className="container">
          <div data-reveal style={{ marginBottom: 'var(--space-2xl)' }}>
            <span className="section-label">✦ Platform Features</span>
            <h2 className="section-title">
              Everything You Need to{' '}
              <span className="gradient-text">Explore India</span>
            </h2>
            <p className="section-subtitle">
              One platform. Infinite discoveries. From live maps to AI-powered visual recognition
              — we've built the most comprehensive India travel intelligence platform ever.
            </p>
          </div>

          <div className="features-grid" id="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card" data-reveal id={`feature-${i}`}
                style={{ transitionDelay: `${i * 70}ms` }}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section className="section" id="services" style={{ background: 'rgba(13,21,37,0.5)' }}>
        <div className="container">
          <div data-reveal style={{ marginBottom: 'var(--space-2xl)' }}>
            <span className="section-label">✦ Our Services</span>
            <h2 className="section-title">
              Powered by{' '}
              <span className="saffron-text">Enterprise-Grade</span> Technology
            </h2>
            <p className="section-subtitle">
              Built by engineers from the world's top tech companies. Every feature is designed to
              work seamlessly — from metropolitan cities to remote Himalayan villages.
            </p>
          </div>

          <div className="services-grid" id="services-grid">
            {services.map((s, i) => (
              <div
                key={i}
                className={`service-card ${s.featured ? 'featured' : ''}`}
                data-reveal
                id={`service-${i}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="service-number">{String(i + 1).padStart(2, '0')}</span>
                <span className={`service-badge ${s.badge}`}>{s.badgeText}</span>
                <h3 className="service-title">{s.title}</h3>
                <p className="service-desc">{s.desc}</p>
                <ul className="service-features">
                  {s.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vision Section ── */}
      <section className="section vision-section" id="vision">
        <div className="vision-bg" />
        <div className="container">
          <div className="vision-content" data-reveal>
            <span className="section-label" style={{ margin: '0 auto var(--space-lg)' }}>
              ✦ Our Vision
            </span>
            <p className="vision-quote">
              To make every corner of India accessible, navigable, and deeply understood by
              every traveller — building the world's most comprehensive digital tourism
              intelligence platform, rooted in India's extraordinary heritage.
            </p>
            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.9rem' }}>
              — BharatDarshan founding charter, 2026
            </p>

            <div className="vision-pillars" id="vision-pillars">
              {visionPillars.map((p, i) => (
                <div key={i} className="vision-pillar" id={`pillar-${i}`}>
                  <span className="vision-pillar-icon">{p.icon}</span>
                  <span className="vision-pillar-title">{p.title}</span>
                  <span className="vision-pillar-desc">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section className="section" id="benefits">
        <div className="container">
          <div className="benefits-wrapper">
            <div data-reveal>
              <span className="section-label">✦ Why BharatDarshan</span>
              <h2 className="section-title">
                Benefits That Make<br />
                <span className="teal-text">Every Journey Better</span>
              </h2>
              <p className="section-subtitle" style={{ marginBottom: 'var(--space-xl)' }}>
                Designed for the modern traveller navigating the world's most diverse and
                culturally rich nation — India.
              </p>
              <div className="benefits-list" id="benefits-list">
                {benefits.map((b, i) => (
                  <div key={i} className="benefit-item" id={`benefit-${i}`}>
                    <div className="benefit-icon">{b.icon}</div>
                    <div>
                      <div className="benefit-title">{b.title}</div>
                      <div className="benefit-desc">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Explore States */}
            <div data-reveal style={{ transitionDelay: '200ms' }}>
              <span className="section-label">✦ Explore States</span>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: 'var(--space-lg)',
              }}>
                Discover Every State of India
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }} id="states-list">
                {INDIA_STATES.map(state => (
                  <Link
                    key={state.id}
                    to={`/state/${state.id}`}
                    id={`state-card-${state.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      padding: 'var(--space-md) var(--space-lg)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--clr-bg-card)',
                      border: '1px solid var(--clr-border)',
                      textDecoration: 'none',
                      color: 'var(--clr-text-primary)',
                      transition: 'all var(--transition-base)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = state.color;
                      e.currentTarget.style.background = `${state.color}11`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--clr-border)';
                      e.currentTarget.style.background = 'var(--clr-bg-card)';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{state.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {state.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                        {state.region} · {state.capital}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: state.color, fontWeight: 600 }}>
                      {state.temperature}
                    </span>
                    <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="section" id="cta" style={{
        background: 'linear-gradient(135deg, rgba(255,107,43,0.08) 0%, rgba(0,212,170,0.05) 100%)',
        borderTop: '1px solid var(--clr-border)',
        borderBottom: '1px solid var(--clr-border)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div data-reveal>
            <div className="live-dot" style={{ justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
              Live & Active
            </div>
            <h2 className="section-title" style={{ maxWidth: 640, margin: '0 auto var(--space-md)' }}>
              Start Your{' '}
              <span className="gradient-text">Incredible India</span>
              {' '}Journey Today
            </h2>
            <p style={{
              color: 'var(--clr-text-secondary)',
              maxWidth: 520,
              margin: '0 auto var(--space-xl)',
              lineHeight: 1.7,
            }}>
              Join thousands of travellers who discover, navigate, and experience India like
              never before with BharatDarshan.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary" id="cta-signup-btn"
                style={{ fontSize: '1rem', padding: '14px 36px' }}>
                🚀 Create Free Account
              </Link>
              <Link to="/map" className="btn btn-secondary" id="cta-map-btn"
                style={{ fontSize: '1rem', padding: '14px 36px' }}>
                🗺️ Explore Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: 36, height: 36,
                  background: 'var(--grad-saffron)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>🗺️</div>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  background: 'var(--grad-saffron)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>BharatDarshan</span>
              </div>
              <p className="footer-brand-desc">
                India's premier AI-powered travel intelligence platform. Discover every state,
                understand every landmark, and navigate with confidence.
              </p>
            </div>
            <div>
              <p className="footer-heading">Platform</p>
              <ul className="footer-links">
                <li><Link to="/map">Live Map</Link></li>
                <li><Link to="/scan">AI Scanner</Link></li>
                <li><Link to="/state/rajasthan">Explore States</Link></li>
                <li><a href="#">Heritage Guide</a></li>
              </ul>
            </div>
            <div>
              <p className="footer-heading">Company</p>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Vision & Mission</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <p className="footer-heading">Support</p>
              <ul className="footer-links">
                <li><a href="#">Help Centre</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 BharatDarshan Technologies Pvt. Ltd. All rights reserved.</span>
            <span>🇮🇳 Made with love in India</span>
          </div>
        </div>
      </footer>
    </>
  );
}
