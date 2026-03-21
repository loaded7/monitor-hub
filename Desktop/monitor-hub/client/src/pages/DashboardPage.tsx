import React, { useEffect, useState } from 'react';
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
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCheck, setNewCheck] = useState({ name: '', url: '', type: 'http' });

  useEffect(() => {
    loadChecks();
    const interval = setInterval(loadChecks, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadChecks = async () => {
    try {
      const res = await api.get('/checks');
      setChecks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/checks', { ...newCheck, method: 'GET', expectedStatusCode: 200 });
      setNewCheck({ name: '', url: '', type: 'http' });
      setShowAddForm(false);
      loadChecks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTest = async (id: string) => {
    try {
      await api.post(`/checks/${id}/test`);
      loadChecks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/checks/${id}`);
      loadChecks();
    } catch (e) {
      console.error(e);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'ok') return 'bg-green-100 text-green-800';
    if (status === 'down') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const statusIcon = (status: string) => {
    if (status === 'ok') return '✅';
    if (status === 'down') return '🔴';
    return '⚠️';
  };

  const okCount = checks.filter(c => c.status === 'ok').length;
  const downCount = checks.filter(c => c.status === 'down').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">MonitorHub</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.fullName}</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{checks.length}</p>
            <p className="text-gray-500 text-sm mt-1">Total Checks</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{okCount}</p>
            <p className="text-gray-500 text-sm mt-1">Online</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{downCount}</p>
            <p className="text-gray-500 text-sm mt-1">Down</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow mb-6">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Health Checks</h2>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Add Check
            </button>
          </div>

          {showAddForm && (
            <div className="px-6 py-4 border-b bg-gray-50">
              <form onSubmit={handleAddCheck} className="flex gap-3 items-end">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Name</label>
                  <input value={newCheck.name} onChange={e => setNewCheck({...newCheck, name: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm w-40" placeholder="My API" required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">URL</label>
                  <input value={newCheck.url} onChange={e => setNewCheck({...newCheck, url: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm w-64" placeholder="https://example.com" required />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Type</label>
                  <select value={newCheck.type} onChange={e => setNewCheck({...newCheck, type: e.target.value})}
                    className="border rounded-lg px-3 py-2 text-sm">
                    <option value="http">HTTP</option>
                    <option value="tcp">TCP</option>
                  </select>
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Save
                </button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
                  Cancel
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : checks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No checks yet. Click <strong>+ Add Check</strong> to start monitoring!
            </div>
          ) : (
            <div className="divide-y">
              {checks.map(check => (
                <div key={check.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{statusIcon(check.status)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{check.name}</p>
                      <p className="text-sm text-gray-500">{check.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {check.responseTimeMs && (
                      <span className="text-sm text-gray-500">{check.responseTimeMs}ms</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(check.status)}`}>
                      {check.status.toUpperCase()}
                    </span>
                    <button onClick={() => handleTest(check.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Test
                    </button>
                    <button onClick={() => handleDelete(check.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};