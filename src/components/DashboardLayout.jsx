import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import {
  HiOutlineHome,
  HiOutlineMap,
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineChartBarSquare,
  HiOutlineArrowRightOnRectangle,
  HiOutlineMagnifyingGlass,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadNotificationCount();
    const interval = setInterval(loadNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificationCount = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 1 });
      setUnreadCount(data.unreadCount);
    } catch (err) {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    const base = [
      { to: `/${user.role === 'admin' ? 'admin' : user.role}`, icon: <HiOutlineHome />, label: 'Dashboard' },
      { to: '/map', icon: <HiOutlineMap />, label: 'Map' },
      { to: '/notifications', icon: <HiOutlineBell />, label: 'Notifications', badge: unreadCount },
      { to: '/chatbot', icon: <HiOutlineChatBubbleLeftRight />, label: 'Chatbot' },
    ];

    if (user.role === 'community') {
      return [
        base[0],
        { to: '/community', icon: <HiOutlineClipboardDocumentList />, label: 'My Requests', end: true },
        ...base.slice(1),
      ];
    }

    if (user.role === 'volunteer') {
      return [
        base[0],
        { to: '/volunteer', icon: <HiOutlineClipboardDocumentList />, label: 'My Tasks', end: true },
        ...base.slice(1),
      ];
    }

    if (user.role === 'coordinator') {
      return [
        base[0],
        { to: '/coordinator', icon: <HiOutlineUserGroup />, label: 'Manage', end: true },
        ...base.slice(1),
      ];
    }

    if (user.role === 'admin') {
      return [
        base[0],
        { to: '/admin', icon: <HiOutlineChartBarSquare />, label: 'Analytics', end: true },
        { to: '/admin', icon: <HiOutlineUsers />, label: 'Users', end: true },
        ...base.slice(1),
      ];
    }

    return base;
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">A</div>
          <span className="logo-text">AidMap</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>
          {getNavItems().map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}

          <div className="sidebar-section">Account</div>
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon"><HiOutlineArrowRightOnRectangle /></span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="btn btn-ghost"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="topbar-search">
            <HiOutlineMagnifyingGlass className="search-icon" />
            <input type="text" placeholder="Search requests, volunteers..." />
          </div>
        </div>
        <div className="topbar-right">
          <button className="notification-btn" onClick={() => navigate('/notifications')}>
            <HiOutlineBell />
            {unreadCount > 0 && <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <div className="user-avatar" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            {initials}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
