import React, { useState } from 'react';
import { useHealthcare } from '../context/HealthcareContext';
import { 
  Stethoscope, 
  Search, 
  Cpu, 
  HeartHandshake, 
  TrendingUp,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const SYMPTOMS_VOCAB = [
  "Fever", "Cough", "Fatigue", "Shortness of breath", "Sore throat",
  "Headache", "Body ache", "Loss of taste/smell", "Runny nose", "Nausea/Vomiting",
  "Diarrhea", "Chest pain", "Chills", "Dizziness", "Skin rash",
  "Joint pain", "Sneezing", "Wheezing", "Heart palpitations", "Excessive thirst",
  "Frequent urination", "Blurred vision", "Unexplained weight loss", "Anxiety", "Insomnia",
  "Heartburn/Acid reflux", "Abdominal pain", "Swollen lymph nodes", "Itchy eyes", "Chronic fatigue"
];

const SymptomChecker = () => {
  const { getPrediction, loading } = useHealthcare();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classifier, setClassifier] = useState('random_forest'); // 'random_forest', 'xgboost', 'compare'
  
  // Predictions state
  const [rfPrediction, setRfPrediction] = useState(null);
  const [xgbPrediction, setXgbPrediction] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [singlePrediction, setSinglePrediction] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSymptomToggle = (idx) => {
    if (selectedSymptoms.includes(idx)) {
      setSelectedSymptoms(prev => prev.filter(item => item !== idx));
    } else {
      setSelectedSymptoms(prev => [...prev, idx]);
    }
  };

  const handleClearAll = () => {
    setSelectedSymptoms([]);
    setSinglePrediction(null);
    setRfPrediction(null);
    setXgbPrediction(null);
    setCompareMode(false);
  };

  const handleAnalyze = async () => {
    setErrorMsg('');
    if (selectedSymptoms.length === 0) {
      setErrorMsg('Please select at least one symptom to run prediction.');
      return;
    }

    if (classifier === 'compare') {
      setCompareMode(true);
      setSinglePrediction(null);
      
      const rfRes = await getPrediction(selectedSymptoms, 'random_forest');
      const xgbRes = await getPrediction(selectedSymptoms, 'xgboost');

      if (rfRes.success) setRfPrediction(rfRes.data);
      if (xgbRes.success) setXgbPrediction(xgbRes.data);
    } else {
      setCompareMode(false);
      setRfPrediction(null);
      setXgbPrediction(null);
      
      const res = await getPrediction(selectedSymptoms, classifier);
      if (res.success) {
        setSinglePrediction(res.data);
      } else {
        setErrorMsg(res.error);
      }
    }
  };

  const filteredSymptoms = SYMPTOMS_VOCAB.map((name, idx) => ({ name, idx }))
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderConfidenceBar = (conf, fromColor = '#00e5ff', toColor = '#4f46e5') => {
    return (
      <div style={{ margin: '1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '0.4rem' }}>
          <span>Confidence Score</span>
          <span>{conf}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${conf}%`, 
              height: '100%', 
              background: `linear-gradient(90deg, ${fromColor}, ${toColor})`, 
              transition: 'width 0.5s ease-in-out' 
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Symptom Checker</h2>
          <p className="page-subtitle">Map symptoms to potential conditions using RF and XGBoost classifiers.</p>
        </div>
      </div>

      {/* Main Grid Layout (Left 2fr for Diagnostics Results, Right 1fr for Symptom checklist selector) */}
      <div className="dashboard-layout">
        
        {/* Results Diagnostic (Left: 2fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Awaiting Inputs default view */}
          {!singlePrediction && !rfPrediction && !xgbPrediction && !loading && (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', items: 'center', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
              <Cpu className="w-12 h-12" style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--text-sub)' }}>Awaiting Diagnostics Input</h4>
              <p className="metric-subtext" style={{ maxWidth: '320px', marginTop: '0.25rem' }}>Select symptoms in the selector panel and press "Analyze" to check for conditions.</p>
            </div>
          )}

          {/* Running Inference view */}
          {loading && (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', items: 'center', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 229, 255, 0.1)', borderTopColor: 'var(--primary-cyan)', borderRadius: '50%', marginBottom: '1.25rem' }}></div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: '#fff' }}>Running ML Inference</h4>
              <p className="metric-subtext" style={{ marginTop: '0.25rem' }}>Ensemble decision boundaries evaluating inputs...</p>
            </div>
          )}

          {/* Single Prediction details */}
          {singlePrediction && !loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Card Title */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="med-pill" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Prediction</span>
                  <h3 className="font-outfit" style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                    {singlePrediction.disease}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="metric-label" style={{ fontSize: '0.55rem' }}>Classifier Engine</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                    <Cpu className="w-4 h-4 text-purple-400" />
                    {singlePrediction.classifier}
                  </span>
                </div>
              </div>

              {renderConfidenceBar(singlePrediction.confidence)}

              <div>
                <span className="metric-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Diagnostic Summary</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  {singlePrediction.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.7rem' }}>
                  <HeartHandshake className="w-4.5 h-4.5" style={{ color: 'var(--status-ok)' }} />
                  Clinical Recommendations
                </span>
                
                <div className="grid-cols-2">
                  {singlePrediction.recommendations.map((rec, i) => (
                    <div key={i} className="glass-card" style={{ padding: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(255,255,255,0.015)' }}>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--primary-cyan)', flexShrink: 0, marginTop: '0.1rem' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compare Classifiers details */}
          {compareMode && !loading && (rfPrediction || xgbPrediction) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="alert-banner alert-info">
                <span>⚡ Double-Classifier Inference active (Random Forest vs XGBoost).</span>
              </div>

              <div className="grid-cols-2">
                {/* Random Forest Column */}
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <span className="metric-label">Random Forest Classifier</span>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  {rfPrediction ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 className="font-outfit" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{rfPrediction.disease}</h4>
                      <p className="metric-subtext" style={{ minHeight: '50px' }}>{rfPrediction.description}</p>
                      {renderConfidenceBar(rfPrediction.confidence, '#00e5ff', '#00b0ff')}
                    </div>
                  ) : (
                    <span style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed.</span>
                  )}
                </div>

                {/* XGBoost Column */}
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <span className="metric-label">XGBoost Classifier</span>
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  {xgbPrediction ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 className="font-outfit" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{xgbPrediction.disease}</h4>
                      <p className="metric-subtext" style={{ minHeight: '50px' }}>{xgbPrediction.description}</p>
                      {renderConfidenceBar(xgbPrediction.confidence, '#9d4edd', '#4f46e5')}
                    </div>
                  ) : (
                    <span style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed.</span>
                  )}
                </div>
              </div>

              {/* Combined advisories */}
              {(() => {
                const primary = (rfPrediction?.confidence || 0) > (xgbPrediction?.confidence || 0) ? rfPrediction : xgbPrediction;
                if (!primary) return null;
                return (
                  <div className="glass-card">
                    <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.7rem' }}>
                      <HeartHandshake className="w-4.5 h-4.5" style={{ color: 'var(--status-ok)' }} />
                      Consolidated Care Protocol (Using {primary.classifier} results)
                    </span>
                    <div className="grid-cols-2">
                      {primary.recommendations.map((rec, i) => (
                        <div key={i} className="glass-card" style={{ padding: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(255,255,255,0.015)', borderRadius: '12px' }}>
                          <ChevronRight className="w-4 h-4" style={{ color: 'var(--primary-cyan)', flexShrink: 0, marginTop: '0.1rem' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Symptoms checklist (Right: 1fr) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              Symptom Selector
            </h3>
            {selectedSymptoms.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '2px 8px', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                Clear ({selectedSymptoms.length})
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="input-container" style={{ marginBottom: '1rem' }}>
            <Search className="input-icon w-4 h-4" />
            <input
              type="text"
              placeholder="Search symptoms (e.g. fever)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '32px', fontSize: '0.75rem' }}
            />
          </div>

          {/* Checklist list boxes */}
          <div className="symptom-flex-box">
            {filteredSymptoms.length > 0 ? (
              filteredSymptoms.map((item) => {
                const isChecked = selectedSymptoms.includes(item.idx);
                return (
                  <button
                    key={item.idx}
                    onClick={() => handleSymptomToggle(item.idx)}
                    className={`symptom-checkbox-btn ${isChecked ? 'selected' : ''}`}
                  >
                    <span>{item.name}</span>
                    {isChecked && <span className="glow-dot-cyan"></span>}
                  </button>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                No symptoms match search query.
              </div>
            )}
          </div>

          {/* Classifier Configuration buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Classifier Engine</label>
              <select
                value={classifier}
                onChange={(e) => setClassifier(e.target.value)}
                className="input-select"
                style={{ fontSize: '0.75rem', padding: '8px' }}
              >
                <option value="random_forest">Random Forest Classifier</option>
                <option value="xgboost">XGBoost Classifier</option>
                <option value="compare">Compare Models (Parallel)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="alert-banner alert-error" style={{ marginBottom: 0 }}>
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '12px' }}
            >
              {loading ? 'Inference active...' : 'Run Diagnostics'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SymptomChecker;
