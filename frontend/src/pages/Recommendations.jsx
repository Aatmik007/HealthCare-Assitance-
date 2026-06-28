import React, { useEffect } from 'react';
import { useHealthcare } from '../context/HealthcareContext';
import { 
  Heart, 
  ShieldAlert, 
  RefreshCw,
  AlertTriangle,
  Smile
} from 'lucide-react';

const Recommendations = () => {
  const { recommendations, loading, fetchRecommendations } = useHealthcare();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Recommendations</h2>
          <p className="page-subtitle">Tailored lifestyle directives, dietary guidelines, and safety alerts.</p>
        </div>
        <button 
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: 'auto', padding: '8px 14px' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Analyze</span>
        </button>
      </div>

      {/* Advisories Feed List */}
      <div className="advisory-card-list">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec) => {
            const isHigh = rec.priority === 'High';
            const isMed = rec.priority === 'Medium';
            const cardClass = isHigh ? 'advisory-card advisory-card-high' : isMed ? 'advisory-card advisory-card-med' : 'advisory-card advisory-card-low';
            const badgeClass = isHigh ? 'priority-badge badge-high' : isMed ? 'priority-badge badge-med' : 'priority-badge badge-low';
            
            return (
              <div key={rec.id} className={cardClass}>
                {/* Meta details */}
                <div className="advisory-meta">
                  <span className={badgeClass}>{rec.priority} Risk</span>
                  <div>
                    <span className="advisory-category-label">Category</span>
                    <span className="advisory-category-val">{rec.category}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="advisory-body">
                  <h3 className="advisory-title">
                    {isHigh ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : isMed ? (
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Smile className="w-5 h-5 text-emerald-400" />
                    )}
                    {rec.title}
                  </h3>
                  <p className="advisory-desc">
                    {rec.description}
                  </p>

                  <div className="advisory-protocol-box">
                    <div className="protocol-title">💡 Action Protocol</div>
                    <p style={{ color: 'var(--text-main)' }}>{rec.action}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', items: 'center', justifyContent: 'center', alignItems: 'center' }}>
            <Heart className="w-16 h-16" style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--text-sub)' }}>Advisory Feed Empty</h4>
            <p className="metric-subtext" style={{ maxWidth: '320px', marginTop: '0.25rem' }}>Log physiological vitals or scan blood panel reports to compile personalized health recommendations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
