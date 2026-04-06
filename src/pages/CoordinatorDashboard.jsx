import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { helpRequestAPI, volunteerAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

const CATEGORY_ICONS = {
  food: '🍚', medical: '🏥', shelter: '🏠', education: '📚',
  sanitation: '🚰', 'disaster-relief': '🌪️', clothing: '👕',
  'mental-health': '🧠', other: '📋',
};

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqRes, volRes] = await Promise.allSettled([
        helpRequestAPI.getAll(),
        volunteerAPI.getAll(),
      ]);
      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data.helpRequests);
      if (volRes.status === 'fulfilled') setVolunteers(volRes.value.data.volunteers);
    } catch (err) {
      setRequests(getDemoRequests());
      setVolunteers(getDemoVolunteers());
    } finally {
      setLoading(false);
    }
  };

  const getDemoRequests = () => [
    { _id: '1', title: 'Food supply needed for 50 families', category: 'food', urgency: 'critical', status: 'pending', location: { address: 'Sector 15, New Delhi' }, numberOfPeopleAffected: 200, createdAt: new Date(Date.now() - 3600000).toISOString(), requester: { name: 'Ajit Singh' } },
    { _id: '2', title: 'Medical camp required', category: 'medical', urgency: 'high', status: 'pending', location: { address: 'Village Rampur, UP' }, numberOfPeopleAffected: 150, createdAt: new Date(Date.now() - 86400000).toISOString(), requester: { name: 'Priya Verma' } },
    { _id: '3', title: 'Tutoring for underprivileged children', category: 'education', urgency: 'medium', status: 'assigned', assignedVolunteer: { name: 'Raj Kumar', _id: 'v1' }, location: { address: 'Community Center, Pune' }, numberOfPeopleAffected: 30, createdAt: new Date(Date.now() - 172800000).toISOString(), requester: { name: 'Anita Kumari' } },
    { _id: '4', title: 'Clean water supply', category: 'sanitation', urgency: 'high', status: 'completed', location: { address: 'Block B, Gurugram' }, numberOfPeopleAffected: 500, createdAt: new Date(Date.now() - 432000000).toISOString(), requester: { name: 'Ravi Shankar' } },
    { _id: '5', title: 'Disaster relief – building collapse', category: 'disaster-relief', urgency: 'critical', status: 'in-progress', assignedVolunteer: { name: 'Suresh Babu', _id: 'v2' }, location: { address: 'Old Town, Hyderabad' }, numberOfPeopleAffected: 50, createdAt: new Date(Date.now() - 14400000).toISOString(), requester: { name: 'Emergency Cell' } },
  ];

  const getDemoVolunteers = () => [
    { _id: 'v1', name: 'Raj Kumar', skills: ['teaching', 'counseling'], tasksCompleted: 12, rating: 4.8, isAvailable: true, email: 'raj@email.com' },
    { _id: 'v2', name: 'Suresh Babu', skills: ['disaster-relief', 'first-aid', 'logistics'], tasksCompleted: 28, rating: 4.9, isAvailable: false, email: 'suresh@email.com' },
    { _id: 'v3', name: 'Dr. Meera Joshi', skills: ['medical', 'first-aid', 'counseling'], tasksCompleted: 35, rating: 5.0, isAvailable: true, email: 'meera@email.com' },
    { _id: 'v4', name: 'Aisha Khan', skills: ['cooking', 'logistics', 'fundraising'], tasksCompleted: 15, rating: 4.7, isAvailable: true, email: 'aisha@email.com' },
    { _id: 'v5', name: 'Vikram Patel', skills: ['driving', 'logistics', 'construction'], tasksCompleted: 20, rating: 4.6, isAvailable: true, email: 'vikram@email.com' },
  ];

  const handleAssign = async (requestId, volunteerId) => {
    try {
      await helpRequestAPI.assign(requestId, volunteerId);
      toast.success('Volunteer assigned successfully!');
      setSelectedRequest(null);
      loadData();
    } catch (err) {
      toast.error('Failed to assign volunteer');
    }
  };

  const stats = {
    totalRequests: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    active: requests.filter(r => ['assigned', 'in-progress'].includes(r.status)).length,
    totalVolunteers: volunteers.length,
    availableVolunteers: volunteers.filter(v => v.isAvailable).length,
  };

  const getUrgencyBadge = (u) => ({ low: 'badge-success', medium: 'badge-primary', high: 'badge-warning', critical: 'badge-danger' }[u] || 'badge-neutral');
  const getStatusBadge = (s) => ({ pending: 'badge-warning', assigned: 'badge-primary', 'in-progress': 'badge-success', completed: 'badge-neutral' }[s] || 'badge-neutral');

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Coordinator Dashboard</h1>
          <p className="page-subtitle">Manage volunteers and assign them to help requests.</p>
        </div>
        <button className="btn btn-outline" onClick={loadData}>
          <HiOutlineArrowPath /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(67,97,238,0.15)', color: 'var(--primary-400)' }}>
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="stat-value">{stats.totalRequests}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning-400)' }}>
            <HiOutlineClipboardDocumentList />
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success-400)' }}>
            <HiOutlineUserGroup />
          </div>
          <div className="stat-value">{stats.totalVolunteers}</div>
          <div className="stat-label">Total Volunteers</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--success-400)' }}>
            <HiOutlineCheckCircle />
          </div>
          <div className="stat-value">{stats.availableVolunteers}</div>
          <div className="stat-label">Available Now</div>
        </div>
      </div>

      <div className="content-grid">
        {/* Requests */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Help Requests</h3>
            <span className="badge badge-warning">{stats.pending} pending</span>
          </div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="request-card">
                <div className="request-header">
                  <div className="request-title">{CATEGORY_ICONS[req.category]} {req.title}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className={`badge ${getUrgencyBadge(req.urgency)}`}>{req.urgency}</span>
                    <span className={`badge ${getStatusBadge(req.status)}`}>{req.status}</span>
                  </div>
                </div>
                <div className="request-meta">
                  <span className="meta-item"><HiOutlineMapPin /> {req.location?.address}</span>
                  <span className="meta-item">👥 {req.numberOfPeopleAffected}</span>
                  <span className="meta-item">🕐 {timeAgo(req.createdAt)}</span>
                  <span className="meta-item">📝 by {req.requester?.name}</span>
                </div>
                {req.assignedVolunteer ? (
                  <p style={{ fontSize: '12px', color: 'var(--success-400)', marginTop: '8px' }}>
                    ✅ Assigned to: {req.assignedVolunteer.name}
                  </p>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '8px' }}
                    onClick={() => setSelectedRequest(req)}
                  >
                    Assign Volunteer
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Volunteers */}
        <div className="glass-card">
          <div className="card-header">
            <h3>Volunteers</h3>
            <span className="badge badge-success">{stats.availableVolunteers} online</span>
          </div>
          {volunteers.map((vol) => (
            <div key={vol._id} className="volunteer-card">
              <div className="vol-avatar">
                {vol.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="vol-info">
                <div className="vol-name">
                  {vol.name}
                  {vol.isAvailable && <span className="live-dot" style={{ display: 'inline-block', marginLeft: '6px', width: '6px', height: '6px' }} />}
                </div>
                <div className="vol-skills">
                  {vol.skills?.slice(0, 3).map(s => (
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

      {/* Assign Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Volunteer</h2>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select a volunteer for: <strong>{selectedRequest.title}</strong>
            </p>
            {volunteers.filter(v => v.isAvailable).map((vol) => (
              <div key={vol._id} className="volunteer-card" style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', marginBottom: '8px', cursor: 'pointer' }} onClick={() => handleAssign(selectedRequest._id, vol._id)}>
                <div className="vol-avatar">
                  {vol.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="vol-info">
                  <div className="vol-name">{vol.name}</div>
                  <div className="vol-skills">
                    {vol.skills?.map(s => (
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
      )}
    </div>
  );
};

export default CoordinatorDashboard;
