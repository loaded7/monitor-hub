import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#2a2a2a', lineHeight: 1 }}>404</div>
        <div style={{ fontSize: 18, fontWeight: 500, color: '#e8e8e8', marginTop: 16, marginBottom: 8 }}>Page not found</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 32 }}>The page you are looking for does not exist.</div>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
};