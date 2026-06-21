import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Stethoscope, 
  FileText, 
  Heart, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon 
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vitals', label: 'Vitals Tracker', icon: Activity },
    { id: 'symptoms', label: 'Symptom Checker', icon: Stethoscope },
    { id: 'reports', label: 'Reports Center', icon: FileText },
    { id: 'recommendations', label: 'Recommendations', icon: Heart }
  ];

  return (
    <aside className="sidebar-panel">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="card-icon-wrapper icon-cyan pulse-heart">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h1 className="brand-title">Aura Health</h1>
          <span className="brand-subtitle">AI Assistant</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1 }}>
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePage(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Information Panel */}
      {user && (
        <div className="sidebar-user-panel">
          <div className="user-profile-summary">
            <div className="user-avatar">
              <UserIcon className="w-4.5 h-4.5" />
            </div>
            <div className="user-details">
              <h4 className="user-name">{user.name}</h4>
              <p className="user-email">{user.email}</p>
            </div>
          </div>

          <div className="medical-badge-card">
            <div className="medical-badge-row">
              <span>Age: <strong>{user.age || 'N/A'}</strong></span>
              <span>Blood: <strong>{user.bloodType || 'N/A'}</strong></span>
            </div>
            <div className="medical-conditions-wrap">
              {user.chronicConditions && user.chronicConditions.length > 0 ? (
                user.chronicConditions.map((c, i) => (
                  <span key={i} className="med-pill">{c}</span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No conditions logged</span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-danger"
            style={{ padding: '8px 14px' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
