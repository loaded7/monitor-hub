import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

interface Check {
  id: string;
  name: string;
  type: string;
  url: string;
  status: string;
  responseTimeMs: number | null;
  lastCheckedAt: string | null;
  intervalSeconds: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [newCheck, setNewCheck] = useState({ name: '', url: '', type: 'http' });
  const [activeNav, setActiveNav] = useState('overview');
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSaved, setAlertSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [alertSaving, setAlertSaving] = useState(false);
const [alertTestSent, setAlertTestSent] = useState(false);

const handleSaveAlert = async () => {
  if (!alertEmail || !alertEmail.includes('@')) return;
  setAlertSaving(true);
  try {
    await api.put('/user/alert-email', { alertEmail });
    setAlertSaved(true);
  } catch (e) {
    console.error(e);
  }
  setAlertSaving(false);
};

const handleTestAlert = async () => {
  try {
    await api.post('/user/test-alert');
    setAlertTestSent(true);
    setTimeout(() => setAlertTestSent(false), 4000);
  } catch (e) {
    console.error(e);
  }
};

  const t = {
    bg: darkMode ? '#0f0f0f' : '#f5f5f4',
    surface: darkMode ? '#1a1a1a' : '#ffffff',
    border: darkMode ? '#2a2a2a' : '#e5e5e3',
    text: darkMode ? '#e8e8e8' : '#0c0c0c',
    textMuted: darkMode ? '#888' : '#999',
    inputBg: darkMode ? '#222' : '#fff',
    inputBorder: darkMode ? '#333' : '#d4d4d0',
    tagBg: darkMode ? '#2a2a2a' : '#f5f5f4',
    tagColor: darkMode ? '#888' : '#666',
  };

  const loadChecks = useCallback(async () => {
    try {
      const res = await api.get('/checks');
      setChecks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecks();
    const interval = setInterval(loadChecks, 15000);
    return () => clearInterval(interval);
  }, [loadChecks]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/checks', { ...newCheck, method: 'GET', expectedStatusCode: 200, intervalSeconds: 300 });
      setNewCheck({ name: '', url: '', type: 'http' });
      setShowForm(false);
      loadChecks();
    } catch (e) { console.error(e); }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      await api.post(`/checks/${id}/test`);
      await new Promise(r => setTimeout(r, 500));
      await loadChecks();
    } catch (e) { console.error(e); }
    setTesting(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/checks/${id}`);
      loadChecks();
    } catch (e) { console.error(e); }
  };

  const okCount = checks.filter(c => c.status === 'ok').length;
  const downCount = checks.filter(c => c.status === 'down').length;
  const avgResponse = checks.filter(c => c.responseTimeMs).length
    ? Math.round(checks.filter(c => c.responseTimeMs).reduce((a, c) => a + (c.responseTimeMs || 0), 0) / checks.filter(c => c.responseTimeMs).length)
    : 0;

  const statusBadge = (status: string) => {
    if (status === 'ok') return { bg: '#EAF3DE', color: '#27500A', dot: '#639922', label: 'Operational' };
    if (status === 'down') return { bg: '#FCEBEB', color: '#791F1F', dot: '#E24B4A', label: 'Down' };
    return { bg: '#FAEEDA', color: '#633806', dot: '#EF9F27', label: 'Degraded' };
  };

  const navDot = (id: string) => {
    if (id === 'overview') return downCount > 0 ? '#E24B4A' : checks.length > 0 ? '#639922' : '#d4d4d0';
    if (id === 'monitors') return checks.length > 0 ? '#639922' : '#d4d4d0';
    if (id === 'incidents') return downCount > 0 ? '#E24B4A' : '#639922';
    if (id === 'alerts') return '#378ADD';
    return '#d4d4d0';
  };

  const maskedKey = (key: string) => key ? `${key.slice(0, 8)}${'•'.repeat(20)}${key.slice(-4)}` : '';

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'monitors', label: 'Monitors' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'alerts', label: 'Alerts' },
  ];

  const pageTitles: Record<string, { title: string; sub: string }> = {
    overview: { title: 'Overview', sub: 'Auto-refreshes every 15s' },
    monitors: { title: 'Monitors', sub: `${checks.length} configured` },
    incidents: { title: 'Incidents', sub: downCount > 0 ? `${downCount} active` : 'All clear' },
    alerts: { title: 'Alerts', sub: 'Notification settings' },
  };

  const inputStyle: React.CSSProperties = {
    border: `0.5px solid ${t.inputBorder}`,
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 13,
    outline: 'none',
    background: t.inputBg,
    color: t.text,
  };

  const AddForm = () => (
    <div style={{ padding: 16, borderBottom: `0.5px solid ${t.border}`, background: darkMode ? '#161616' : '#fafaf9' }}>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Name</div>
          <input
            value={newCheck.name}
            onChange={e => setNewCheck(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My API" required
            style={{ ...inputStyle, width: 150 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>URL</div>
          <input
            value={newCheck.url}
            onChange={e => setNewCheck(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com" required
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Type</div>
          <select
            value={newCheck.type}
            onChange={e => setNewCheck(prev => ({ ...prev, type: e.target.value }))}
            style={{ ...inputStyle }}
          >
            <option value="http">HTTP</option>
            <option value="tcp">TCP</option>
          </select>
        </div>
        <button type="submit" style={{ padding: '7px 16px', background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
        <button type="button" onClick={() => setShowForm(false)} style={{ padding: '7px 16px', background: 'transparent', border: `0.5px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: t.textMuted }}>Cancel</button>
      </form>
    </div>
  );

  const MonitorsTable = () => (
    <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: t.text }}>Monitors</span>
        <span style={{ fontSize: 11, color: t.textMuted }}>{checks.length} total</span>
      </div>
      {showForm && <AddForm />}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>Loading...</div>
      ) : checks.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: t.textMuted, fontSize: 13 }}>No monitors yet. Click + Add monitor to start.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${t.border}` }}>
              {['Monitor', 'Status', 'Response', 'Type', 'Last check', ''].map((h, i) => (
                <th key={i} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checks.map(check => {
              const badge = statusBadge(check.status);
              return (
                <tr key={check.id} style={{ borderBottom: `0.5px solid ${t.border}` }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: t.text }}>{check.name}</div>
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{check.url}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: badge.bg, color: badge.color }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot, flexShrink: 0 }} />
                      {badge.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {check.responseTimeMs ? (
                      <>
                        <div style={{ color: t.text }}>{check.responseTimeMs}ms</div>
                        <div style={{ height: 3, borderRadius: 2, background: darkMode ? '#333' : '#E6F1FB', marginTop: 4, width: 80 }}>
                          <div style={{ height: '100%', borderRadius: 2, background: check.responseTimeMs < 300 ? '#639922' : check.responseTimeMs < 800 ? '#EF9F27' : '#E24B4A', width: `${Math.min(100, Math.round(check.responseTimeMs / 10))}%` }} />
                        </div>
                      </>
                    ) : <span style={{ color: t.textMuted }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: t.tagBg, color: t.tagColor, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{check.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: t.textMuted }}>
                    {check.lastCheckedAt ? new Date(check.lastCheckedAt).toLocaleTimeString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleTest(check.id)} disabled={testing === check.id}
                        style={{ padding: '4px 10px', border: `0.5px solid ${t.inputBorder}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', color: testing === check.id ? t.textMuted : '#185FA5' }}>
                        {testing === check.id ? '...' : 'Test'}
                      </button>
                      <button onClick={() => handleDelete(check.id)}
                        style={{ padding: '4px 10px', border: '0.5px solid #f7c1c1', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', color: '#A32D2D' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderContent = () => {
    if (activeNav === 'incidents') {
      const incidents = checks.filter(c => c.status === 'down' || c.status === 'degraded');
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>Incidents</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>Monitors currently down or degraded</div>
          </div>
          <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {incidents.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: t.text, marginBottom: 4 }}>All systems operational</div>
                <div style={{ fontSize: 13, color: t.textMuted }}>No active incidents right now.</div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `0.5px solid ${t.border}` }}>
                    {['Monitor', 'Status', 'Since', 'Response'].map((h, i) => (
                      <th key={i} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(check => {
                    const badge = statusBadge(check.status);
                    return (
                      <tr key={check.id} style={{ borderBottom: `0.5px solid ${t.border}` }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 500, color: t.text }}>{check.name}</div>
                          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{check.url}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: badge.bg, color: badge.color }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.dot, flexShrink: 0 }} />
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: t.textMuted }}>
                          {check.lastCheckedAt ? new Date(check.lastCheckedAt).toLocaleTimeString() : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: t.textMuted }}>
                          {check.responseTimeMs ? `${check.responseTimeMs}ms` : 'Timeout'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    if (activeNav === 'alerts') {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>Alerts</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>Get notified when a monitor goes down</div>
          </div>
          <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 4 }}>Email notifications</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>You will receive an email when a monitor goes down or recovers</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>Notification email</div>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={e => { setAlertEmail(e.target.value); setAlertSaved(false); }}
                  placeholder={user?.email}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <button onClick={handleSaveAlert} disabled={alertSaving}
                style={{ padding: '8px 16px', background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                {alertSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleTestAlert}
                style={{ padding: '8px 16px', background: 'transparent', border: `0.5px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: t.textMuted, flexShrink: 0 }}>
                Send test
              </button>
            </div>
            {alertSaved && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#27500A', background: '#EAF3DE', padding: '6px 10px', borderRadius: 6 }}>
                Saved! Email alerts are now active for all monitors.
              </div>
            )}
            {alertTestSent && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#185FA5', background: '#E6F1FB', padding: '6px 10px', borderRadius: 6 }}>
                Test email sent! Check your inbox.
              </div>
            )}
          </div>
          <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 4 }}>Monitors with alerts enabled</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 16 }}>All active monitors will trigger alerts</div>
            {checks.length === 0 ? (
              <div style={{ fontSize: 13, color: t.textMuted }}>No monitors configured yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {checks.map(check => {
                  const badge = statusBadge(check.status);
                  return (
                    <div key={check.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: t.bg, borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: badge.dot, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{check.name}</div>
                          <div style={{ fontSize: 11, color: t.textMuted }}>{check.url}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, background: '#EAF3DE', color: '#27500A', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>Alerts on</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeNav === 'monitors') {
      return <MonitorsTable />;
    }

    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total monitors', value: checks.length, sub: `${checks.length} checks`, subColor: t.textMuted },
            { label: 'Operational', value: okCount, sub: checks.length ? `${Math.round(okCount / checks.length * 100)}% online` : '—', subColor: '#3B6D11' },
            { label: 'Down', value: downCount, sub: downCount > 0 ? 'needs attention' : 'all clear', subColor: downCount > 0 ? '#A32D2D' : '#3B6D11' },
            { label: 'Avg response', value: avgResponse ? `${avgResponse}ms` : '—', sub: avgResponse < 300 ? 'good' : avgResponse < 800 ? 'fair' : 'slow', subColor: avgResponse < 300 ? '#3B6D11' : avgResponse < 800 ? '#854F0B' : '#A32D2D' },
          ].map((s, i) => (
            <div key={i} style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: t.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.subColor, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <MonitorsTable />
        <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: 12, padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 8 }}>API Key</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code style={{ flex: 1, fontSize: 12, background: t.bg, padding: '7px 10px', borderRadius: 8, color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {apiKeyVisible ? user?.apiKey : maskedKey(user?.apiKey || '')}
            </code>
            <button onClick={() => setApiKeyVisible(!apiKeyVisible)}
              style={{ padding: '6px 12px', border: `0.5px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'transparent', color: t.textMuted, flexShrink: 0 }}>
              {apiKeyVisible ? 'Hide' : 'Show'}
            </button>
            <button onClick={() => navigator.clipboard.writeText(user?.apiKey || '')}
              style={{ padding: '6px 12px', border: `0.5px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'transparent', color: t.textMuted, flexShrink: 0 }}>
              Copy
            </button>
          </div>
        </div>
      </>
    );
  };

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bg }}><p style={{ color: t.textMuted }}>Loading...</p></div>;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', background: t.bg, overflow: 'hidden' }}>
      <div style={{ width: 220, background: t.surface, borderRight: `0.5px solid ${t.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: `0.5px solid ${t.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#185FA5' }}>MonitorHub</div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Infrastructure monitoring</div>
        </div>
        <nav style={{ padding: '8px 0', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setActiveNav(item.id)}
              style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                color: activeNav === item.id ? t.text : t.textMuted,
                background: activeNav === item.id ? t.bg : 'transparent',
                fontWeight: activeNav === item.id ? 500 : 400 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: navDot(item.id), flexShrink: 0 }} />
              {item.label}
              {item.id === 'incidents' && downCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#FCEBEB', color: '#791F1F', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99 }}>{downCount}</span>
              )}
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: `0.5px solid ${t.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#0C447C', flexShrink: 0 }}>
              {user.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: t.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{ width: '100%', padding: '6px', border: `0.5px solid ${t.border}`, borderRadius: 8, background: 'transparent', fontSize: 12, color: t.textMuted, cursor: 'pointer', marginBottom: 6 }}>
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', padding: '6px', border: `0.5px solid ${t.border}`, borderRadius: 8, background: 'transparent', fontSize: 12, color: t.textMuted, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', background: t.surface, borderBottom: `0.5px solid ${t.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{pageTitles[activeNav]?.title}</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 1 }}>{pageTitles[activeNav]?.sub}</div>
          </div>
          {(activeNav === 'overview' || activeNav === 'monitors') && (
            <button onClick={() => setShowForm(!showForm)}
              style={{ padding: '7px 16px', background: '#185FA5', color: '#E6F1FB', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              + Add monitor
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};