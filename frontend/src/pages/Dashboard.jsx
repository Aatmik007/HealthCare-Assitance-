import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthcare } from '../context/HealthcareContext';
import { 
  Activity, 
  FileText, 
  Heart, 
  User as UserIcon, 
  Check, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Smile
} from 'lucide-react';

const Dashboard = ({ setActivePage }) => {
  const { user, updateProfile } = useAuth();
  const { 
    vitals, 
    reports, 
    recommendations, 
    fetchVitals, 
    fetchReports, 
    fetchRecommendations 
  } = useHealthcare();

  // State for profile editing
  const [age, setAge] = useState(user?.age || 30);
  const [gender, setGender] = useState(user?.gender || 'Unspecified');
  const [bloodType, setBloodType] = useState(user?.bloodType || 'Unknown');
  const [chronicConditions, setChronicConditions] = useState(user?.chronicConditions || []);
  const [editing, setEditing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const conditionOptions = [
    'Hypertension', 'Diabetes', 'Asthma', 'Allergies', 'Migraine', 'GERD', 'Anxiety'
  ];

  useEffect(() => {
    fetchVitals();
    fetchReports();
    fetchRecommendations();
  }, []);

  const handleConditionToggle = (cond) => {
    if (chronicConditions.includes(cond)) {
      setChronicConditions(prev => prev.filter(c => c !== cond));
    } else {
      setChronicConditions(prev => [...prev, cond]);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveMsg('');
    const res = await updateProfile({
      age,
      gender,
      bloodType,
      chronicConditions
    });
    if (res.success) {
      setSaveMsg('Profile saved successfully!');
      setEditing(false);
      fetchRecommendations(); // Update recommendations
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const getLatestReading = (type) => {
    if (!vitals || vitals.length === 0) return 'N/A';
    const latest = vitals[0];
    switch (type) {
      case 'hr': return `${latest.heartRate} bpm`;
      case 'bp': return `${latest.systolic}/${latest.diastolic} mmHg`;
      case 'spo2': return `${latest.spo2}%`;
      case 'sugar': return latest.bloodSugar ? `${latest.bloodSugar} mg/dL` : 'N/A';
      default: return 'N/A';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Welcome, {user?.name}</h2>
          <p className="page-subtitle">Here is your clinical dashboard summary for today.</p>
        </div>
        <button 
          onClick={() => { fetchVitals(); fetchReports(); fetchRecommendations(); }}
          className="btn btn-secondary btn-icon-only"
          title="Refresh Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Metrics Row (3 cards) */}
      <div className="metrics-row">
        {/* Vitals Summary Card */}
        <div 
          onClick={() => setActivePage('vitals')}
          className="glass-card glass-card-hover"
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-card-content">
            <div className="card-icon-wrapper icon-cyan pulse-heart">
              <Activity className="w-5 h-5" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Latest Vitals Log</span>
              <h3 className="metric-value">{getLatestReading('bp')}</h3>
              <p className="metric-subtext">HR: {getLatestReading('hr')} | SpO2: {getLatestReading('spo2')}</p>
            </div>
            <ArrowRight className="w-4 h-4" style={{ alignSelf: 'center', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Reports Summary Card */}
        <div 
          onClick={() => setActivePage('reports')}
          className="glass-card glass-card-hover"
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-card-content">
            <div className="card-icon-wrapper icon-purple">
              <FileText className="w-5 h-5" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Uploaded Scans</span>
              <h3 className="metric-value">{reports?.length || 0} Reports</h3>
              <p className="metric-subtext">
                {reports && reports.length > 0 
                  ? `Last: ${reports[0].fileName}`
                  : 'No report uploads registered.'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4" style={{ alignSelf: 'center', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Recommendations Card */}
        <div 
          onClick={() => setActivePage('recommendations')}
          className="glass-card glass-card-hover"
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-card-content">
            <div className="card-icon-wrapper icon-emerald">
              <Heart className="w-5 h-5" />
            </div>
            <div className="metric-info">
              <span className="metric-label">Advisory Alerts</span>
              <h3 className="metric-value">{recommendations?.length || 0} Suggest</h3>
              <p className="metric-subtext">
                {recommendations && recommendations.filter(r => r.priority === 'High').length > 0 
                  ? '⚠️ High-risk indicators flagged.'
                  : 'All indicators in safe range.'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4" style={{ alignSelf: 'center', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="dashboard-layout">
        
        {/* Active Advisories (Left Column: 2fr) */}
        <div className="glass-card">
          <div className="card-title-group">
            <div className="card-icon-wrapper icon-cyan">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit" style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Health Advisories</h3>
              <p className="metric-subtext">Priority clinical suggestions based on your profile inputs</p>
            </div>
          </div>

          <div className="advisory-card-list" style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec) => {
                const isHigh = rec.priority === 'High';
                const isMed = rec.priority === 'Medium';
                const cardClass = isHigh ? 'advisory-card advisory-card-high' : isMed ? 'advisory-card advisory-card-med' : 'advisory-card advisory-card-low';
                const badgeClass = isHigh ? 'priority-badge badge-high' : isMed ? 'priority-badge badge-med' : 'priority-badge badge-low';
                
                return (
                  <div key={rec.id} className={cardClass}>
                    <div className="advisory-meta">
                      <span className={badgeClass}>{rec.priority}</span>
                      <div>
                        <span className="advisory-category-label">Category</span>
                        <span className="advisory-category-val">{rec.category}</span>
                      </div>
                    </div>
                    <div className="advisory-body">
                      <h4 className="advisory-title">
                        {isHigh ? (
                          <AlertTriangle className="w-4.5 h-4.5" style={{ color: 'var(--status-err)' }} />
                        ) : isMed ? (
                          <ShieldAlert className="w-4.5 h-4.5" style={{ color: 'var(--status-warn)' }} />
                        ) : (
                          <Smile className="w-4.5 h-4.5" style={{ color: 'var(--status-ok)' }} />
                        )}
                        {rec.title}
                      </h4>
                      <p className="advisory-desc">{rec.description}</p>
                      <div className="advisory-protocol-box">
                        <div className="protocol-title">💡 Action Protocol</div>
                        <p style={{ color: 'var(--text-main)' }}>{rec.action}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Heart className="w-12 h-12" style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No clinical advisories available. Log vitals to generate alerts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Profile Card (Right Column: 1fr) */}
        <div className="glass-card">
          <div className="card-title-group">
            <div className="card-icon-wrapper icon-purple">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit" style={{ fontSize: '1.05rem', fontWeight: 700 }}>Medical File</h3>
              <p className="metric-subtext">Demographics and conditions</p>
            </div>
          </div>

          {saveMsg && (
            <div className="alert-banner alert-success">
              <span>{saveMsg}</span>
            </div>
          )}

          {!editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="metric-label" style={{ fontSize: '0.6rem' }}>Patient Age</span>
                  <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {user?.age || 'Unspecified'} yrs
                  </span>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="metric-label" style={{ fontSize: '0.6rem' }}>Gender</span>
                  <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-main)', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                    {user?.gender || 'Unspecified'}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="metric-label" style={{ fontSize: '0.6rem' }}>Blood Type</span>
                <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {user?.bloodType || 'Unknown'}
                </span>
              </div>

              <div>
                <span className="metric-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.6rem' }}>Chronic Diagnoses</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {user?.chronicConditions && user.chronicConditions.length > 0 ? (
                    user.chronicConditions.map((cond, i) => (
                      <span key={i} className="med-pill" style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '8px' }}>
                        {cond}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No conditions registered.</span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setEditing(true)}
                className="btn btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Modify Medical File
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Age</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  className="input-text"
                  min="0" max="120"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="input-select"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unspecified">Unspecified</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Blood Type</label>
                  <select 
                    value={bloodType} 
                    onChange={(e) => setBloodType(e.target.value)}
                    className="input-select"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosed Chronic Conditions</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', maxHeight: '130px', overflowY: 'auto', paddingRight: '4px' }}>
                  {conditionOptions.map((cond, i) => {
                    const isChecked = chronicConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handleConditionToggle(cond)}
                        className={`symptom-checkbox-btn ${isChecked ? 'selected' : ''}`}
                        style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                      >
                        <span>{cond}</span>
                        {isChecked && <span className="glow-dot-cyan"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>Save</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditing(false);
                    setAge(user?.age || 30);
                    setGender(user?.gender || 'Unspecified');
                    setBloodType(user?.bloodType || 'Unknown');
                    setChronicConditions(user?.chronicConditions || []);
                  }} 
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
