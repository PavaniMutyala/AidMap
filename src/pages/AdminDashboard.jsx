import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTrendingUp,
  HiOutlineGlobeAlt,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

const CATEGORY_COLORS = {
  food: 'var(--warning-500)',
  medical: 'var(--danger-500)',
  shelter: 'var(--primary-500)',
  education: 'var(--success-500)',
  sanitation: '#06b6d4',
  'disaster-relief': '#ef4444',
  clothing: '#a855f7',
  'mental-health': '#ec4899',
  other: 'var(--gray-500)',
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await analyticsAPI.getDashboard();
      setAnalytics(data);
    } catch (err) {
      // Demo data
      setAnalytics(getDemoAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getDemoAnalytics = () => ({
    overview: {
      totalRequests: 1247,
      pendingRequests: 89,
      activeRequests: 156,
      completedRequests: 982,
      totalVolunteers: 2413,
      activeVolunteers: 1856,
      totalCommunityUsers: 4520,
      totalPeopleHelped: 52340,
    },
    categoryStats: [
      { _id: 'food', count: 380 },
      { _id: 'medical', count: 275 },
      { _id: 'education', count: 198 },
      { _id: 'shelter', count: 142 },
      { _id: 'disaster-relief', count: 95 },
      { _id: 'sanitation', count: 82 },
      { _id: 'mental-health', count: 45 },
      { _id: 'clothing', count: 30 },
    ],
    urgencyStats: [
      { _id: 'critical', count: 45 },
      { _id: 'high', count: 180 },
      { _id: 'medium', count: 620 },
      { _id: 'low', count: 402 },
    ],
    statusStats: [
      { _id: 'pending', count: 89 },
      { _id: 'assigned', count: 56 },
      { _id: 'in-progress', count: 100 },
      { _id: 'completed', count: 982 },
      { _id: 'cancelled', count: 20 },
    ],
    weeklyTrend: [
      { _id: '2024-03-29', count: 12 },
      { _id: '2024-03-30', count: 18 },
      { _id: '2024-03-31', count: 15 },
      { _id: '2024-04-01', count: 22 },
      { _id: '2024-04-02', count: 28 },
      { _id: '2024-04-03', count: 35 },
      { _id: '2024-04-04', count: 20 },
    ],
    topVolunteers: [
      { name: 'Dr. Meera Joshi', tasksCompleted: 35, rating: 5.0, skills: ['medical', 'first-aid'] },
      { name: 'Suresh Babu', tasksCompleted: 28, rating: 4.9, skills: ['disaster-relief', 'logistics'] },
      { name: 'Vikram Patel', tasksCompleted: 20, rating: 4.6, skills: ['driving', 'construction'] },
      { name: 'Aisha Khan', tasksCompleted: 15, rating: 4.7, skills: ['cooking', 'fundraising'] },
      { name: 'Raj Kumar', tasksCompleted: 12, rating: 4.8, skills: ['teaching', 'counseling'] },
    ],
  });

  if (loading || !analytics) {
    return (
      <div className="page-container">
        <div className="loading-spinner" style={{ height: '60vh' }}><div className="spinner" /></div>
      </div>
    );
  }

  const { overview, categoryStats, urgencyStats, statusStats, weeklyTrend, topVolunteers } = analytics;
  const maxCatCount = Math.max(...categoryStats.map(c => c.count), 1);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Command Dashboard</h1>
          <p className="page-subtitle">Platform analytics and management overview.</p>
        </div>
        <button className="btn btn-outline" onClick={loadAnalytics}>
          <HiOutlineArrowPath /> Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(67,97,238,0.15)', color: 'var(--primary-400)' }}>
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="stat-value">{overview.totalRequests.toLocaleString()}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(247,37,133,0.15)', color: 'var(--accent-400)' }}>
            <HiOutlineUserGroup />
          </div>
          <div className="stat-value">{overview.totalVolunteers.toLocaleString()}</div>
          <div className="stat-label">Total Volunteers</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success-400)' }}>
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-value">{overview.completedRequests.toLocaleString()}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            <HiOutlineGlobeAlt />
          </div>
          <div className="stat-value">{(overview.totalPeopleHelped / 1000).toFixed(1)}K</div>
          <div className="stat-label">People Helped</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning-400)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pending</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '18px' }}>{overview.pendingRequests}</span>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-400)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '18px' }}>{overview.activeRequests}</span>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Volunteers</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '18px' }}>{overview.activeVolunteers}</span>
        </div>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-400)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Community Users</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '18px' }}>{overview.totalCommunityUsers.toLocaleString()}</span>
        </div>
      </div>

      <div className="content-grid">
        {/* Category Breakdown Chart */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Requests by Category</h3>
            <HiOutlineArrowTrendingUp style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="card-body">
            <div className="chart-placeholder">
              {categoryStats.map((cat) => (
                <div key={cat._id} className="chart-bar-row">
                  <span className="label">{cat._id.replace('-', ' ')}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(cat.count / maxCatCount) * 100}%`,
                        background: CATEGORY_COLORS[cat._id] || 'var(--gray-500)',
                      }}
                    >
                      {cat.count}
                    </div>
                  </div>
                  <span className="count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Volunteers */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Top Volunteers</h3>
            <span className="badge badge-accent">This Month</span>
          </div>
          {topVolunteers.map((vol, idx) => (
            <div key={idx} className="volunteer-card">
              <div
                className="vol-avatar"
                style={{
                  background: idx === 0 ? 'var(--gradient-accent)' : idx === 1 ? 'var(--gradient-success)' : 'var(--gradient-primary)',
                }}
              >
                {idx + 1}
              </div>
              <div className="vol-info">
                <div className="vol-name">{vol.name}</div>
                <div className="vol-skills">
                  {vol.skills?.slice(0, 2).map(s => (
                    <span key={s} className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="vol-stats">
                <div className="vol-rating">⭐ {vol.rating}</div>
                <div className="vol-tasks">{vol.tasksCompleted} tasks</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency & Status */}
      <div className="grid-2" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="glass-card">
          <div className="card-header">
            <h3>By Urgency Level</h3>
          </div>
          <div className="card-body">
            {urgencyStats.map((u) => {
              const totalU = urgencyStats.reduce((sum, x) => sum + x.count, 0);
              const pct = ((u.count / totalU) * 100).toFixed(1);
              const colors = { critical: 'var(--danger-500)', high: 'var(--warning-500)', medium: 'var(--primary-500)', low: 'var(--success-500)' };
              return (
                <div key={u._id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{u._id}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="fill" style={{ width: `${pct}%`, background: colors[u._id] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <h3>By Status</h3>
          </div>
          <div className="card-body">
            {statusStats.map((s) => {
              const totalS = statusStats.reduce((sum, x) => sum + x.count, 0);
              const pct = ((s.count / totalS) * 100).toFixed(1);
              const colors = { pending: 'var(--warning-400)', assigned: 'var(--primary-400)', 'in-progress': 'var(--success-400)', completed: 'var(--gray-400)', cancelled: 'var(--danger-400)' };
              return (
                <div key={s._id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{s._id}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div className="fill" style={{ width: `${pct}%`, background: colors[s._id] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="glass-card" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3>Weekly Request Trend</h3>
          <span className="badge badge-primary">Last 7 Days</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', paddingTop: '20px' }}>
            {weeklyTrend.map((day, idx) => {
              const maxDay = Math.max(...weeklyTrend.map(d => d.count));
              const height = (day.count / maxDay) * 160;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{day.count}</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${height}px`,
                      background: 'var(--gradient-primary)',
                      borderRadius: 'var(--radius-sm)',
                      minHeight: '20px',
                      transition: 'height 0.6s ease',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {day._id.split('-').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
