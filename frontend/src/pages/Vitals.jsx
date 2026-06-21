import React, { useState, useEffect } from 'react';
import { useHealthcare } from '../context/HealthcareContext';
import { 
  Activity, 
  Trash2, 
  Plus, 
  TrendingUp, 
  Clock, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const Vitals = () => {
  const { vitals, loading, error, logVitals, fetchVitals, clearVitals } = useHealthcare();

  // Form states
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // Chart view selection
  const [activeChart, setActiveChart] = useState('bp'); // 'bp', 'hr', 'spo2', 'sugar'

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    if (!heartRate || !systolic || !diastolic || !temperature || !spo2) {
      setFormMsg({ type: 'error', text: 'Please fill in all core physiological vitals.' });
      return;
    }

    const payload = {
      heartRate: Number(heartRate),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      temperature: Number(temperature),
      spo2: Number(spo2),
      respiratoryRate: respiratoryRate ? Number(respiratoryRate) : undefined,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined
    };

    const res = await logVitals(payload);
    if (res.success) {
      setFormMsg({ type: 'success', text: 'Vitals logged successfully!' });
      // Reset inputs
      setHeartRate('');
      setSystolic('');
      setDiastolic('');
      setTemperature('');
      setSpo2('');
      setRespiratoryRate('');
      setBloodSugar('');
      setTimeout(() => setFormMsg({ type: '', text: '' }), 3000);
    } else {
      setFormMsg({ type: 'error', text: res.error });
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your entire vitals history? This cannot be undone.")) {
      await clearVitals();
    }
  };

  const getVitalStatus = (vital) => {
    const { heartRate, systolic, diastolic, spo2, temperature } = vital;
    if (systolic >= 140 || diastolic >= 90 || spo2 < 92 || temperature > 38.5) {
      return 'critical';
    } else if (systolic >= 130 || diastolic >= 80 || spo2 < 95 || heartRate > 100 || heartRate < 55) {
      return 'warning';
    }
    return 'normal';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'critical': 
        return <span className="status-indicator status-err-bg">🔴 Critical</span>;
      case 'warning': 
        return <span className="status-indicator status-warn-bg">🟡 Warning</span>;
      default: 
        return <span className="status-indicator status-ok-bg">🟢 Normal</span>;
    }
  };

  const getChartData = () => {
    if (!vitals || vitals.length === 0) return [];
    const data = [...vitals].reverse(); // oldest first
    return data.map(v => {
      const date = new Date(v.createdAt);
      return {
        dateStr: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        timestamp: date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        Systolic: v.systolic,
        Diastolic: v.diastolic,
        'Heart Rate': v.heartRate,
        'SpO2 (%)': v.spo2,
        'Blood Sugar': v.bloodSugar || 0
      };
    });
  };

  const chartData = getChartData();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Vitals Tracker</h2>
          <p className="page-subtitle">Log, observe, and graph primary vital indicators.</p>
        </div>
        {vitals && vitals.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="btn btn-danger"
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Vitals Archive</span>
          </button>
        )}
      </div>

      {/* Main Content Layout (Left Column 2fr for charts, Right Column 1fr for log Form) */}
      <div className="dashboard-layout">
        
        {/* Charts & Table logs (Left: 2fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recharts Analytics Panel */}
          <div className="glass-card">
            <div className="chart-box-header">
              <div className="card-title-group" style={{ marginBottom: 0 }}>
                <div className="card-icon-wrapper icon-cyan">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Physiological Diagnostics</h3>
                  <p className="metric-subtext">Real-time vital charting</p>
                </div>
              </div>

              {/* Chart Selector Tabs */}
              <div className="chart-tab-list">
                {[
                  { id: 'bp', label: 'BP Trends' },
                  { id: 'hr', label: 'Heart Rate' },
                  { id: 'spo2', label: 'SpO2' },
                  { id: 'sugar', label: 'Glucose' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id)}
                    className={`chart-tab-btn ${activeChart === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts graph plot */}
            <div style={{ height: '280px', width: '100%' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis 
                      dataKey="dateStr" 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      fontSize={10} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="rgba(255, 255, 255, 0.3)" 
                      fontSize={10} 
                      tickLine={false}
                      domain={activeChart === 'bp' ? [45, 185] : activeChart === 'spo2' ? [85, 101] : 'auto'}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#fff'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {activeChart === 'bp' && (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="Systolic" 
                          stroke="#00e5ff" 
                          strokeWidth={2.5} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Diastolic" 
                          stroke="#9d4edd" 
                          strokeWidth={2.5} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                        />
                      </>
                    )}
                    {activeChart === 'hr' && (
                      <Line 
                        type="monotone" 
                        dataKey="Heart Rate" 
                        stroke="#00e5ff" 
                        strokeWidth={2.5} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    )}
                    {activeChart === 'spo2' && (
                      <Line 
                        type="monotone" 
                        dataKey="SpO2 (%)" 
                        stroke="#10b981" 
                        strokeWidth={2.5} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    )}
                    {activeChart === 'sugar' && (
                      <Line 
                        type="monotone" 
                        dataKey="Blood Sugar" 
                        stroke="#f59e0b" 
                        strokeWidth={2.5} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6 }} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', items: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', alignItems: 'center' }}>
                  Log at least 2 entries to visualize vital diagrams.
                </div>
              )}
            </div>
          </div>

          {/* Historical records table */}
          <div className="glass-card">
            <div className="card-title-group">
              <div className="card-icon-wrapper icon-purple">
                <Clock className="w-5 h-5" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Record History</h3>
            </div>

            <div className="table-wrapper">
              {vitals && vitals.length > 0 ? (
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>BP (mmHg)</th>
                      <th>Heart Rate</th>
                      <th>SpO2</th>
                      <th>Temp (°C)</th>
                      <th>Glucose</th>
                      <th style={{ textAlignment: 'right', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.map((v, idx) => {
                      const date = new Date(v.createdAt);
                      const status = getVitalStatus(v);
                      return (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text-main)' }}>
                            {date.toLocaleDateString()} &nbsp;
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--primary-cyan)' }}>{v.systolic}/{v.diastolic}</td>
                          <td>{v.heartRate} bpm</td>
                          <td>{v.spo2}%</td>
                          <td>{v.temperature}°C</td>
                          <td style={{ color: 'var(--status-warn)' }}>{v.bloodSugar ? `${v.bloodSugar} mg/dL` : '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            {getStatusBadge(status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No historical vital entries compiled.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Logger Form Column (Right: 1fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card">
            <div className="card-title-group">
              <div className="card-icon-wrapper icon-cyan">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Log Vitals</h3>
                <p className="metric-subtext">Record physiological indicators</p>
              </div>
            </div>

            {formMsg.text && (
              <div className={`alert-banner ${formMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Heart Rate (bpm)</label>
                  <input 
                    type="number" 
                    value={heartRate} 
                    onChange={(e) => setHeartRate(e.target.value)} 
                    placeholder="e.g. 72"
                    className="input-text" 
                    min="35" max="220"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Temp (°C)</label>
                  <input 
                    type="number" 
                    value={temperature} 
                    onChange={(e) => setTemperature(e.target.value)} 
                    placeholder="e.g. 36.6"
                    className="input-text" 
                    step="0.1" min="30" max="45"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="metric-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.65rem' }}>Blood Pressure (mmHg)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="number" 
                      value={systolic} 
                      onChange={(e) => setSystolic(e.target.value)} 
                      placeholder="Sys (e.g. 120)"
                      className="input-text" 
                      min="50" max="250"
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="number" 
                      value={diastolic} 
                      onChange={(e) => setDiastolic(e.target.value)} 
                      placeholder="Dia (e.g. 80)"
                      className="input-text" 
                      min="35" max="150"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>SpO2 Oxygen (%)</label>
                  <input 
                    type="number" 
                    value={spo2} 
                    onChange={(e) => setSpo2(e.target.value)} 
                    placeholder="e.g. 98"
                    className="input-text" 
                    min="50" max="100"
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Respiration (br/m)</label>
                  <input 
                    type="number" 
                    value={respiratoryRate} 
                    onChange={(e) => setRespiratoryRate(e.target.value)} 
                    placeholder="e.g. 16"
                    className="input-text" 
                    min="5" max="50"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Blood Sugar (mg/dL) - Fasting/Random</label>
                <input 
                  type="number" 
                  value={bloodSugar} 
                  onChange={(e) => setBloodSugar(e.target.value)} 
                  placeholder="e.g. 95"
                  className="input-text" 
                  min="20" max="500"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', padding: '12px' }}
              >
                {loading ? 'Submitting...' : 'Register Log'}
              </button>
            </form>
          </div>

          {/* Reference Info Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Info className="w-4 h-4" style={{ color: 'var(--primary-cyan)' }} />
              Clinician Guidance
            </h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', fontSize: '0.7rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>BP: Stage 2 Hypertension defined above 140/90.</li>
              <li>SpO2: Normal levels are 95-100%. Under 95% indicates hypoxia.</li>
              <li>Pulse: Optimal resting heart rate is between 60-100 bpm.</li>
              <li>Temp: Pyrexia (Fever) diagnosed above 37.8°C.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Vitals;
