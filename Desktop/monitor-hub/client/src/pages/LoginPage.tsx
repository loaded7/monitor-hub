import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) { setLocalError('Fill in all fields'); return; }
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Invalid email or password');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#185FA5', marginBottom: 6 }}>MonitorHub</div>
          <div style={{ fontSize: 14, color: '#666' }}>Infrastructure monitoring platform</div>
        </div>

        <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e8e8e8', marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>Sign in to your account</div>

          {(error || localError) && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #f7c1c1', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#791F1F', marginBottom: 20 }}>
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Email</div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                style={{ width: '100%', background: '#222', border: '0.5px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e8e8e8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Password</div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                style={{ width: '100%', background: '#222', border: '0.5px solid #333', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e8e8e8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '0.5px solid #2a2a2a', textAlign: 'center', fontSize: 13, color: '#666' }}>
            No account?{' '}
            <Link to="/signup" style={{ color: '#378ADD', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 24 }}>
          {[
            { label: 'HTTP monitoring', dot: '#639922' },
            { label: 'Email alerts', dot: '#378ADD' },
            { label: 'Real-time status', dot: '#EF9F27' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.dot }} />
              {f.label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};