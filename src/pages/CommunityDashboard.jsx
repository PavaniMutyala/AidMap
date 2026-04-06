import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { helpRequestAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlusCircle,
  HiOutlineMapPin,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const CATEGORIES = [
  'food', 'medical', 'shelter', 'education', 'sanitation',
  'disaster-relief', 'clothing', 'mental-health', 'other',
];

const CATEGORY_ICONS = {
  food: '🍚', medical: '🏥', shelter: '🏠', education: '📚',
  sanitation: '🚰', 'disaster-relief': '🌪️', clothing: '👕',
  'mental-health': '🧠', other: '📋',
};

const CommunityDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'food',
    urgency: 'medium',
    address: '',
    numberOfPeopleAffected: 1,
    requiredSkills: [],
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data } = await helpRequestAPI.getAll();
      setRequests(data.helpRequests);
    } catch (err) {
      // Demo data for when backend is unavailable
      setRequests(getDemoRequests());
    } finally {
      setLoading(false);
    }
  };

  const getDemoRequests = () => [
    {
      _id: '1',
      title: 'Food supply needed for 50 families',
      description: 'Families in sector 15 affected by flooding need immediate food supplies.',
      category: 'food',
      urgency: 'critical',
      status: 'pending',
      location: { address: 'Sector 15, New Delhi' },
      numberOfPeopleAffected: 200,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: '2',
      title: 'Medical camp required',
      description: 'Need volunteer doctors for a health check-up camp in rural area.',
      category: 'medical',
      urgency: 'high',
      status: 'assigned',
      assignedVolunteer: { name: 'Dr. Priya Sharma' },
      location: { address: 'Village Rampur, UP' },
      numberOfPeopleAffected: 150,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: '3',
      title: 'Tutoring for underprivileged children',
      description: 'Looking for volunteers to teach math and science to children.',
      category: 'education',
      urgency: 'medium',
      status: 'in-progress',
      assignedVolunteer: { name: 'Raj Kumar' },
      location: { address: 'Community Center, Pune' },
      numberOfPeopleAffected: 30,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: '4',
      title: 'Clean water supply',
      description: 'Drinking water supply disrupted in the area. Need clean water distribution.',
      category: 'sanitation',
      urgency: 'high',
      status: 'completed',
      location: { address: 'Block B, Gurugram' },
      numberOfPeopleAffected: 500,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Random coordinates around India for demo
      const lat = 20 + Math.random() * 10;
      const lng = 73 + Math.random() * 10;

      await helpRequestAPI.create({
        ...form,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
          address: form.address || 'Location not specified',
        },
      });
      toast.success('Help request submitted! Matching volunteers...');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'food', urgency: 'medium', address: '', numberOfPeopleAffected: 1, requiredSkills: [] });
      loadRequests();
    } catch (err) {
      toast.error('Failed to submit request');
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    active: requests.filter((r) => ['assigned', 'in-progress'].includes(r.status)).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      assigned: 'badge-primary',
      'in-progress': 'badge-success',
      completed: 'badge-neutral',
      cancelled: 'badge-danger',
    };
    return map[status] || 'badge-neutral';
  };

  const getUrgencyBadge = (urgency) => {
    const map = {
      low: 'badge-success',
      medium: 'badge-primary',
      high: 'badge-warning',
      critical: 'badge-danger',
    };
    return map[urgency] || 'badge-neutral';
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Track your help requests.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlusCircle /> New Help Request
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(67,97,238,0.15)', color: 'var(--primary-400)' }}>
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning-400)' }}>
            <HiOutlineClock />
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success-400)' }}>
            <HiOutlineExclamationTriangle />
          </div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(148,163,184,0.15)', color: 'var(--gray-400)' }}>
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Requests List */}
      <div className="glass-card">
        <div className="card-header">
          <h3>Your Help Requests</h3>
          <span className="badge badge-primary">{requests.length} total</span>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No requests yet</h3>
            <p>Submit your first help request and we'll find volunteers near you.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
              <HiOutlinePlusCircle /> Create Request
            </button>
          </div>
        ) : (
          <div>
            {requests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="request-header">
                  <div className="request-title">
                    {CATEGORY_ICONS[req.category]} {req.title}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge ${getUrgencyBadge(req.urgency)}`}>{req.urgency}</span>
                    <span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span>
                  </div>
                </div>
                <div className="request-desc">{req.description}</div>
                <div className="request-meta">
                  <span className="meta-item">
                    <HiOutlineMapPin /> {req.location?.address || 'N/A'}
                  </span>
                  <span className="meta-item">👥 {req.numberOfPeopleAffected} affected</span>
                  <span className="meta-item">🕐 {timeAgo(req.createdAt)}</span>
                  {req.assignedVolunteer && (
                    <span className="meta-item" style={{ color: 'var(--success-400)' }}>
                      ✓ Assigned to {req.assignedVolunteer.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Help Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Title *</label>
                <input
                  className="input-field"
                  placeholder="Brief title of your need"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Description *</label>
                <textarea
                  className="input-field"
                  placeholder="Describe the help you need in detail..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="row-2">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_ICONS[c]} {c.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Urgency</label>
                  <select
                    className="input-field"
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Location / Address</label>
                <input
                  className="input-field"
                  placeholder="Enter your location"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Number of People Affected</label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  value={form.numberOfPeopleAffected}
                  onChange={(e) => setForm({ ...form, numberOfPeopleAffected: parseInt(e.target.value) || 1 })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDashboard;
