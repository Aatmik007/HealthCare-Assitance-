import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, register, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    if (!email || !password) {
      setLocalError('Please fill out all credentials.');
      return;
    }

    if (!isLogin && !name) {
      setLocalError('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="glass-card auth-card">
        {/* Header logo & title */}
        <div className="auth-header">
          <div className="auth-logo pulse-heart">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="auth-title">Aura Health</h2>
          <p className="auth-subtitle">
            Secure AI assistant for vitals tracking, symptom checking, and lab reports analysis.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            onClick={() => { setIsLogin(true); setLocalError(''); setError(null); }}
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setLocalError(''); setError(null); }}
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification banner */}
        {(localError || error) && (
          <div className="alert-banner alert-error">
            <span>⚠️</span>
            <span>{localError || error}</span>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-container">
                <span className="input-icon">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe"
                  className="input-text"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-container">
              <span className="input-icon">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@aurahealth.org"
                className="input-text"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Secure Password</label>
            <div className="input-container">
              <span className="input-icon">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-text"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem', padding: '12px' }}>
            {isLogin ? 'Authenticate Access' : 'Create Secure Profile'}
          </button>
        </form>

        {/* Disclaimers */}
        <div className="auth-disclaimer">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--primary-cyan)' }} />
          <span>Encrypted HIPAA-compliant local database</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
