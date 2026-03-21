import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!fullName || !email || !password) { setLocalError('Fill in all fields'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    try {
      await signup(fullName, email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError('Could not create account. Try again.');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#222',
    border: '0.5px solid #333',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: '#e8e8e8',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#185FA5', marginBottom: 6 }}>MonitorHub</div>
          <div style={{ fontSize: 14, color: '#666' }}>Infrastructure monitoring platform</div>
        </div>

        <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e8e8e8', marginBottom: 4 }}>Create account</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>Start monitoring your infrastructure</div>

          {(error || localError) && (
            <div style={{ background: '#FCEBEB', border: '0.5px solid #f7c1c1', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#791F1F', marginBottom: 20 }}>
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Full name</div>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Thomas Modesto" disabled={isLoading} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" disabled={isLoading} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Password</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Confirm password</div>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} style={inputStyle} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '0.5px solid #2a2a2a', textAlign: 'center', fontSize: 13, color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#378ADD', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>

        <div style={{ marginTop: 24, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>What you get for free</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { text: 'Up to 10 monitors', dot: '#639922' },
              { text: 'Email alerts on downtime', dot: '#639922' },
              { text: 'Auto checks every 5 minutes', dot: '#639922' },
              { text: 'Incident history', dot: '#639922' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.dot, flexShrink: 0 }} />
                {f.text}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};