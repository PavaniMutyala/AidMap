import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { HiOutlineBellAlert, HiOutlineCheckCircle, HiOutlineEnvelopeOpen } from 'react-icons/hi2';

const NOTIF_ICONS = {
  'help-request-created': '📋',
  'help-request-assigned': '✅',
  'help-request-completed': '🎉',
  'volunteer-matched': '🤝',
  'task-accepted': '💪',
  'new-message': '💬',
  system: '🔔',
};

const NOTIF_COLORS = {
  'help-request-created': 'rgba(245,158,11,0.15)',
  'help-request-assigned': 'rgba(67,97,238,0.15)',
  'help-request-completed': 'rgba(16,185,129,0.15)',
  'volunteer-matched': 'rgba(247,37,133,0.15)',
  'task-accepted': 'rgba(52,211,153,0.15)',
  'new-message': 'rgba(99,102,241,0.15)',
  system: 'rgba(148,163,184,0.15)',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 50 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setNotifications(getDemoNotifications());
      setUnreadCount(3);
    } finally {
      setLoading(false);
    }
  };

  const getDemoNotifications = () => [
    { _id: '1', type: 'volunteer-matched', title: 'New Help Request Nearby', message: 'A new food help request "Food supply for 50 families" needs your cooking skills. Urgency: critical', read: false, createdAt: new Date(Date.now() - 300000).toISOString(), sender: { name: 'Chennai Relief Org' } },
    { _id: '2', type: 'help-request-assigned', title: 'Task Assigned to You', message: 'You have been assigned to: "Medical camp at Rampur Village"', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), sender: { name: 'Coordinator Amit' } },
    { _id: '3', type: 'help-request-completed', title: 'Request Completed!', message: 'Your help request "Clean water supply" has been completed! Thank you for your patience.', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: '4', type: 'task-accepted', title: 'Volunteer Accepted Your Request', message: 'Dr. Meera Joshi has accepted your help request: "Medical camp required"', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), sender: { name: 'Dr. Meera Joshi' } },
    { _id: '5', type: 'system', title: 'Welcome to AidMap!', message: 'Thank you for registering. Explore the dashboard and start helping your community today.', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
    { _id: '6', type: 'volunteer-matched', title: 'Skill Match Found', message: 'Your teaching skill matches a new education request in Pune. Check available requests.', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
    { _id: '7', type: 'help-request-created', title: 'New Critical Request', message: 'A critical disaster-relief request has been submitted in your area.', read: true, createdAt: new Date(Date.now() - 345600000).toISOString() },
  ];

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
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
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAllRead}>
            <HiOutlineEnvelopeOpen /> Mark All Read
          </button>
        )}
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔕</div>
            <h3>No notifications</h3>
            <p>You'll receive notifications when there are updates about help requests and tasks.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && handleMarkRead(notif._id)}
              >
                <div
                  className="notif-icon"
                  style={{ background: NOTIF_COLORS[notif.type] || 'var(--bg-glass)' }}
                >
                  {NOTIF_ICONS[notif.type] || '🔔'}
                </div>
                <div className="notif-content">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-message">{notif.message}</div>
                  <div className="notif-time">
                    {timeAgo(notif.createdAt)}
                    {notif.sender && ` • from ${notif.sender.name}`}
                  </div>
                </div>
                {!notif.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-400)', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
