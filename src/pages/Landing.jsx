import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineBolt,
  HiOutlineChatBubbleLeftRight,
  HiOutlineChartBar,
  HiOutlineBellAlert,
} from 'react-icons/hi2';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <HiOutlineMapPin />,
      title: 'Smart Location Mapping',
      description: 'Visualize help requests on an interactive heat map. Identify areas with the highest needs at a glance.',
      color: 'var(--primary-500)',
    },
    {
      icon: <HiOutlineUserGroup />,
      title: 'AI Volunteer Matching',
      description: 'Our intelligent system matches volunteers with requests based on skills, proximity, and availability.',
      color: 'var(--accent-400)',
    },
    {
      icon: <HiOutlineBolt />,
      title: 'Real-Time Allocation',
      description: 'Instantly assign and manage volunteers. Track task progress from submission to completion.',
      color: 'var(--warning-500)',
    },
    {
      icon: <HiOutlineChatBubbleLeftRight />,
      title: 'Built-in Chatbot',
      description: 'Get instant answers to common questions. Navigate the platform with AI-powered guidance.',
      color: 'var(--success-500)',
    },
    {
      icon: <HiOutlineChartBar />,
      title: 'Analytics Dashboard',
      description: 'Track community impact with powerful analytics. Generate weekly reports and monitor volunteer performance.',
      color: '#a855f7',
    },
    {
      icon: <HiOutlineBellAlert />,
      title: 'Smart Notifications',
      description: 'Stay informed with real-time alerts. Never miss a help request or task assignment.',
      color: '#ec4899',
    },
  ];

  return (
    <div className="landing-page">
      {/* Background Image with Zoom Effect */}
      <div className="hero-bg">
        <img
          src="https://thumbs.dreamstime.com/b/happy-group-young-adult-volunteers-serving-free-food-poor-people-need-charity-workers-291361882.jpg"
          alt="Volunteers serving food to community"
        />
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="logo">
          <div className="logo-icon">A</div>
          <span>AidMap</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🌍 Empowering Communities Worldwide</div>
          <h1 className="hero-title">
            Connect <span className="gradient-text">Volunteers</span> with
            <br />
            Communities <span className="accent-text">in Need</span>
          </h1>
          <p className="hero-subtitle">
            AidMap is a smart volunteer allocation system that maps community needs
            and automatically matches them with nearby skilled volunteers for faster, more effective aid distribution.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Helping Today →
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-number">2,400+</div>
              <div className="stat-text">Volunteers Active</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">8,500+</div>
              <div className="stat-text">Requests Fulfilled</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">150+</div>
              <div className="stat-text">NGOs Connected</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">50K+</div>
              <div className="stat-text">People Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Powerful Features
            </span>
          </h2>
          <p>Everything you need to coordinate community aid efficiently and effectively.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card glass-card">
              <div
                className="feature-icon"
                style={{ background: `${feature.color}20`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="features-section" id="about" style={{ background: 'transparent' }}>
        <div className="section-header">
          <h2>How AidMap <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</span></h2>
          <p>A simple three-step process to connect those who need help with those who can provide it.</p>
        </div>
        <div className="features-grid" style={{ maxWidth: '900px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            { step: '01', title: 'Submit a Request', desc: 'Community members post their needs — food, medical help, education, and more.' },
            { step: '02', title: 'Smart Matching', desc: 'Our AI engine finds the best volunteers based on skills and proximity.' },
            { step: '03', title: 'Deliver Help', desc: 'Volunteers accept tasks, provide aid, and mark completion for tracking.' },
          ].map((item, idx) => (
            <div key={idx} className="feature-card glass-card">
              <div
                className="feature-icon"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 800,
                }}
              >
                {item.step}
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 AidMap — Smart Volunteer Allocation System. Built with ❤️ for communities worldwide.</p>
      </footer>
    </div>
  );
};

export default Landing;
