import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { helpRequestAPI, volunteerAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineBolt,
  HiOutlineMapPin,
  HiOutlineHandRaised,
} from 'react-icons/hi2';

const CATEGORY_ICONS = {
  food: '🍚', medical: '🏥', shelter: '🏠', education: '📚',
  sanitation: '🚰', 'disaster-relief': '🌪️', clothing: '👕',
  'mental-health': '🧠', other: '📋',
};

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, activeTasks: 0, rating: 5 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, tasksRes, allRes] = await Promise.allSettled([
        volunteerAPI.getStats(),
        volunteerAPI.getMyTasks(),
        helpRequestAPI.getAll({ status: 'pending' }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data.tasks);
      if (allRes.status === 'fulfilled') setAvailableRequests(allRes.value.data.helpRequests);
    } catch (err) {
      // Demo data
      setAvailableRequests(getDemoAvailable());
      setTasks(getDemoTasks());
    } finally {
      setLoading(false);
    }
  };

  const getDemoAvailable = () => [
    {
      _id: 'a1',
      title: 'Food distribution for flood victims',
      description: 'Need volunteers to distribute food packages to 100 families affected by recent flooding.',
      category: 'food',
      urgency: 'critical',
      status: 'pending',
      location: { address: 'River Bank Colony, Chennai' },
      requiredSkills: ['cooking', 'driving', 'logistics'],
      numberOfPeopleAffected: 400,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      requester: { name: 'Chennai Relief Organization' },
    },
    {
      _id: 'a2',
      title: 'Medical check-up camp volunteers',
      description: 'Doctors and first-aid trained volunteers needed for a weekend health camp.',
      category: 'medical',
      urgency: 'high',
      status: 'pending',
      location: { address: 'Rural Health Center, Jaipur' },
      requiredSkills: ['medical', 'first-aid'],
      numberOfPeopleAffected: 200,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      requester: { name: 'Health First NGO' },
    },
    {
      _id: 'a3',
      title: 'Teaching English to children',
      description: 'Weekly English classes for underprivileged children aged 8-14.',
      category: 'education',
      urgency: 'medium',
      status: 'pending',
      location: { address: 'Sunshine Community Hall, Mumbai' },
      requiredSkills: ['teaching', 'translation'],
      numberOfPeopleAffected: 25,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      requester: { name: 'Bright Future Foundation' },
    },
  ];

  const getDemoTasks = () => [
    {
      _id: 't1',
      title: 'Deliver blankets to shelter',
      category: 'shelter',
      urgency: 'high',
      status: 'in-progress',
      location: { address: 'Night Shelter, Delhi Gate' },
      numberOfPeopleAffected: 80,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      requester: { name: 'Shelter Foundation' },
    },
  ];

  const handleAccept = async (id) => {
    try {
      await helpRequestAPI.accept(id);
      toast.success('Task accepted! Check your tasks tab.');
      loadData();
    } catch (err) {
      toast.error('Could not accept task');
    }
  };

  const handleComplete = async (id) => {
    try {
      await helpRequestAPI.complete(id);
      toast.success('Task marked as completed! Great work! 🎉');
      loadData();
    } catch (err) {
      toast.error('Could not complete task');
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getUrgencyBadge = (urgency) => {
    const map = { low: 'badge-success', medium: 'badge-primary', high: 'badge-warning', critical: 'badge-danger' };
    return map[urgency] || 'badge-neutral';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Volunteer Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.name}. Here's your volunteer overview.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="live-dot" />
          <span style={{ fontSize: '13px', color: 'var(--success-400)', fontWeight: 600 }}>Available</span>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(67,97,238,0.15)', color: 'var(--primary-400)' }}>
            <HiOutlineBolt />
          </div>
          <div className="stat-value">{stats.totalTasks || tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success-400)' }}>
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-value">{stats.completedTasks || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning-400)' }}>
            <HiOutlineClock />
          </div>
          <div className="stat-value">{stats.activeTasks || tasks.filter(t => t.status !== 'completed').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--warning-400)' }}>
            <HiOutlineStar />
          </div>
          <div className="stat-value">{stats.rating || 5}.0</div>
          <div className="stat-label">Rating</div>
        </div>
      </div>

      {/* Skills */}
      {user?.skills?.length > 0 && (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Skills:</span>
            {user.skills.map((s) => (
              <span key={s} className="tag">{s.replace('-', ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-lg)' }}>
        <button
          className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('available')}
        >
          <HiOutlineHandRaised /> Available Requests ({availableRequests.length})
        </button>
        <button
          className={`btn ${activeTab === 'my-tasks' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('my-tasks')}
        >
          <HiOutlineCheckCircle /> My Tasks ({tasks.length})
        </button>
      </div>

      {/* Content */}
      <div className="glass-card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : activeTab === 'available' ? (
          availableRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No requests nearby</h3>
              <p>All caught up! New help requests will appear here when submitted.</p>
            </div>
          ) : (
            availableRequests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="request-header">
                  <div className="request-title">{CATEGORY_ICONS[req.category]} {req.title}</div>
                  <span className={`badge ${getUrgencyBadge(req.urgency)}`}>{req.urgency}</span>
                </div>
                <div className="request-desc">{req.description}</div>
                <div className="request-meta">
                  <span className="meta-item"><HiOutlineMapPin /> {req.location?.address}</span>
                  <span className="meta-item">👥 {req.numberOfPeopleAffected} affected</span>
                  <span className="meta-item">🕐 {timeAgo(req.createdAt)}</span>
                  {req.requiredSkills?.length > 0 && (
                    <span className="meta-item">
                      🛠️ {req.requiredSkills.join(', ')}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleAccept(req._id)}>
                    Accept Task
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tasks yet</h3>
              <p>Accept available requests to start helping your community.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="request-card">
                <div className="request-header">
                  <div className="request-title">{CATEGORY_ICONS[task.category]} {task.title}</div>
                  <span className={`badge ${task.status === 'completed' ? 'badge-neutral' : 'badge-success'}`}>
                    {task.status}
                  </span>
                </div>
                <div className="request-meta">
                  <span className="meta-item"><HiOutlineMapPin /> {task.location?.address}</span>
                  <span className="meta-item">👥 {task.numberOfPeopleAffected} affected</span>
                </div>
                {task.status !== 'completed' && (
                  <div style={{ marginTop: '12px' }}>
                    <button className="btn btn-accent btn-sm" onClick={() => handleComplete(task._id)}>
                      <HiOutlineCheckCircle /> Mark Complete
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
