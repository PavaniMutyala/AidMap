import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SKILLS = [
  'medical', 'teaching', 'cooking', 'driving', 'counseling',
  'construction', 'first-aid', 'logistics', 'tech-support',
  'translation', 'childcare', 'elderly-care', 'disaster-relief',
  'sanitation', 'fundraising',
];

const HELP_TYPES = [
  'food', 'medical', 'shelter', 'education', 'sanitation',
  'disaster-relief', 'clothing', 'mental-health', 'other',
];

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'community',
    skills: [],
    helpType: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to AidMap, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card" style={{ maxWidth: '560px' }}>
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">A</div>
          </div>
          <h1>Create Account</h1>
          <p>Join AidMap and make a difference</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="row-2">
            <div className="input-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="input-field"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              id="reg-email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Password *</label>
            <input
              id="reg-password"
              type="password"
              className="input-field"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="role">Your Role *</label>
            <select
              id="role"
              className="input-field"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              <option value="community">Community / Person in Need</option>
              <option value="volunteer">Volunteer</option>
              <option value="coordinator">Volunteer Coordinator</option>
            </select>
          </div>

          {(form.role === 'volunteer' || form.role === 'coordinator') && (
            <div className="input-group">
              <label>Select Your Skills</label>
              <div className="skills-select">
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className={`skill-chip ${form.skills.includes(skill) ? 'selected' : ''}`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {form.role === 'community' && (
            <div className="input-group">
              <label htmlFor="helpType">Type of Help Needed</label>
              <select
                id="helpType"
                className="input-field"
                value={form.helpType}
                onChange={(e) => handleChange('helpType', e.target.value)}
              >
                <option value="">Select type...</option>
                {HELP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
