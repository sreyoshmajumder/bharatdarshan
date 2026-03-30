import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPass) {
      setError('Please fill in all fields.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.'); return;
    }

    const result = await signup(name, email, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/map'), 1500);
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthColors = ['transparent', '#ef4444', '#F59E0B', '#22c55e'];
  const strengthLabels = ['', 'Weak', 'Moderate', 'Strong'];

  return (
    <div className="auth-page" id="signup-page">
      <div className="auth-glow-1" aria-hidden />
      <div className="auth-glow-2" aria-hidden />

      <div className="auth-card" id="signup-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🗺️</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join BharatDarshan for free</p>
        </div>

        {success ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '8px' }}>
              Welcome, {name}!
            </h3>
            <p style={{ color: 'var(--clr-text-secondary)' }}>
              Account created! Taking you to the map...
            </p>
          </div>
        ) : (
          <form className="auth-form" id="signup-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fca5a5',
                fontSize: '0.85rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                className="form-input"
                type="text"
                placeholder="Ravi Shankar"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '48px', width: '100%' }}
                  required
                />
                <button
                  type="button"
                  id="toggle-signup-password"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--clr-text-muted)', fontSize: '1rem',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password Strength */}
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        height: 3, flex: 1, borderRadius: '2px',
                        background: i <= strength ? strengthColors[strength] : 'var(--clr-border)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                style={{
                  borderColor: confirmPass && confirmPass !== password
                    ? '#ef4444'
                    : confirmPass && confirmPass === password
                    ? '#22c55e'
                    : undefined,
                }}
                required
              />
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>🚀 Create Account</>
              )}
            </button>
          </form>
        )}

        <p className="auth-switch" style={{ marginTop: success ? '16px' : undefined }}>
          Already have an account?{' '}
          <Link to="/login" id="switch-to-login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
