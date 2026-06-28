import React, { useState, useEffect } from 'react';
import { useHealthcare } from '../context/HealthcareContext';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Clock, 
  Activity, 
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const { 
    reports, 
    loading, 
    uploadReport, 
    fetchReports, 
    clearReports 
  } = useHealthcare();

  const [selectedFile, setSelectedFile] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [showFullText, setShowFullText] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (reports && reports.length > 0 && !activeReport) {
      setActiveReport(reports[0]);
    }
  }, [reports]);

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setErrorMsg('Please upload JPEG or PNG images only.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Maximum file size is 5MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedFile) {
      setErrorMsg('Please select a report image to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('report', selectedFile);

    const res = await uploadReport(formData);
    if (res.success) {
      setSelectedFile(null);
      setActiveReport(res.report);
      const fileInput = document.getElementById('report-file-input');
      if (fileInput) fileInput.value = '';
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your entire reports history?")) {
      await clearReports();
      setActiveReport(null);
    }
  };

  const evaluateMarker = (marker, val) => {
    if (val === null || val === undefined) return { label: 'Not found', class: 'text-[hsl(var(--text-muted))]' };

    switch (marker) {
      case 'hemoglobin':
        if (val < 12.0) return { label: 'Low Hb', class: 'status-indicator status-err-bg' };
        if (val > 17.5) return { label: 'High Hb', class: 'status-indicator status-warn-bg' };
        return { label: 'Optimal', class: 'status-indicator status-ok-bg' };

      case 'wbc':
        if (val < 4500) return { label: 'Leukopenia (Low)', class: 'status-indicator status-err-bg' };
        if (val > 11000) return { label: 'Leukocytosis (Elevated)', class: 'status-indicator status-warn-bg' };
        return { label: 'Optimal', class: 'status-indicator status-ok-bg' };

      case 'glucose':
        if (val < 70) return { label: 'Hypoglycemia', class: 'status-indicator status-err-bg' };
        if (val > 140) return { label: 'Hyperglycemia', class: 'status-indicator status-err-bg' };
        if (val > 100) return { label: 'Impaired Fasting', class: 'status-indicator status-warn-bg' };
        return { label: 'Optimal', class: 'status-indicator status-ok-bg' };

      case 'cholesterol':
        if (val >= 240) return { label: 'High Risk', class: 'status-indicator status-err-bg' };
        if (val >= 200) return { label: 'Borderline High', class: 'status-indicator status-warn-bg' };
        return { label: 'Optimal', class: 'status-indicator status-ok-bg' };

      default:
        return { label: 'Checked', class: 'status-indicator status-ok-bg' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports Center (OCR)</h2>
          <p className="page-subtitle">Scan clinical laboratory printouts and extract diagnostic stats.</p>
        </div>
        {reports && reports.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="btn btn-danger"
            style={{ width: 'auto', padding: '8px 14px' }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {/* Main Grid Layout (Left 2fr for Scan detail outputs, Right 1fr for uploader panels) */}
      <div className="dashboard-layout">
        
        {/* Detail scan output (Left: 2fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {loading && (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', items: 'center', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 229, 255, 0.1)', borderTopColor: 'var(--primary-cyan)', borderRadius: '50%', marginBottom: '1.25rem' }}></div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: '#fff' }}>Running OCR Engine</h4>
              <p className="metric-subtext" style={{ marginTop: '0.25rem' }}>Extracting text matrix and evaluating biomarkers...</p>
            </div>
          )}

          {!activeReport && !loading && (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', items: 'center', justifyContent: 'center', height: '100%', alignItems: 'center' }}>
              <FileText className="w-12 h-12" style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--text-sub)' }}>Awaiting File Scans</h4>
              <p className="metric-subtext" style={{ maxWidth: '320px', marginTop: '0.25rem' }}>Upload a lab report scan on the right panel to initiate automatic text-to-metric processing.</p>
            </div>
          )}

          {activeReport && !loading && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Header details */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <span className="med-pill">Extracted lab panel</span>
                <h3 className="font-outfit" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  {activeReport.fileName}
                </h3>
                <p className="metric-subtext" style={{ marginTop: '0.2rem' }}>
                  Processed: {new Date(activeReport.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Table of Parsed Biomarkers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontSize: '0.7rem' }}>
                  <Activity className="w-4.5 h-4.5" style={{ color: 'var(--primary-cyan)' }} />
                  Biomarker Evaluation
                </span>

                <div className="table-wrapper" style={{ marginTop: 0 }}>
                  <table className="lab-table" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th>Marker Name</th>
                        <th>Extracted Level</th>
                        <th>Reference Limits</th>
                        <th style={{ textAlignment: 'right', textAlign: 'right' }}>Evaluation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'hemoglobin', label: 'Hemoglobin (Hb)', ref: '12.0 - 17.5 g/dL', unit: ' g/dL' },
                        { key: 'wbc', label: 'White Blood Cell (WBC)', ref: '4,500 - 11,000 /mcL', unit: ' /mcL' },
                        { key: 'glucose', label: 'Blood Glucose', ref: '70 - 100 mg/dL (fasting)', unit: ' mg/dL' },
                        { key: 'cholesterol', label: 'Total Cholesterol', ref: '< 200 mg/dL', unit: ' mg/dL' }
                      ].map((item, idx) => {
                        const val = activeReport.parsedVitals?.[item.key];
                        const evaluation = evaluateMarker(item.key, val);
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 500 }}>{item.label}</td>
                            <td style={{ fontWeight: 600, color: val !== null ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {val !== null && val !== undefined ? `${val}${item.unit}` : 'Not detected'}
                            </td>
                            <td>{item.ref}</td>
                            <td style={{ textAlign: 'right' }}>
                              {val !== null ? (
                                <span className={evaluation.class}>{evaluation.label}</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontStyle: 'italic' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Collapsible raw text block */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="collapsible-trigger-btn"
                >
                  <span>Raw OCR Text Output</span>
                  {showFullText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFullText && (
                  <div className="collapsible-body animate-fade-in">
                    {activeReport.extractedText || 'No transcripts extracted.'}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Upload & History (Right: 1fr) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Uploader Card */}
          <div className="glass-card">
            <div className="card-title-group">
              <div className="card-icon-wrapper icon-cyan">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upload Panel</h3>
                <p className="metric-subtext">JPEG or PNG laboratory print</p>
              </div>
            </div>

            {errorMsg && (
              <div className="alert-banner alert-error">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="drag-drop-panel">
                <input 
                  type="file" 
                  id="report-file-input"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <FileText className="w-8 h-8 text-muted" style={{ margin: '0 auto 0.75rem' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', color: 'var(--text-main)' }}>
                  {selectedFile ? selectedFile.name : 'Select Lab Scan'}
                </span>
                <span className="metric-subtext" style={{ fontSize: '0.65rem', display: 'block', marginTop: '0.2rem' }}>
                  {selectedFile 
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : 'JPG, JPEG, or PNG (Max 5MB)'}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="btn btn-primary"
                style={{ padding: '10px' }}
              >
                {loading ? 'Processing OCR Scan...' : 'Scan Report File'}
              </button>
            </form>
          </div>

          {/* History Lists */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '280px' }}>
            <div className="card-title-group">
              <div className="card-icon-wrapper icon-purple">
                <Clock className="w-5 h-5" />
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Scan Archive</h3>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '4px' }}>
              {reports && reports.length > 0 ? (
                reports.map((rep) => {
                  const date = new Date(rep.createdAt);
                  const isActive = activeReport?._id === rep._id;
                  return (
                    <button
                      key={rep._id}
                      onClick={() => { setActiveReport(rep); setShowFullText(false); }}
                      className={`symptom-checkbox-btn ${isActive ? 'selected' : ''}`}
                      style={{ padding: '8px 12px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <FileCheck className="w-4 h-4 text-cyan-400" style={{ flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rep.fileName}</p>
                          <span className="metric-subtext" style={{ fontSize: '0.6rem' }}>{date.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', display: 'block', padding: '1rem' }}>
                  No files scanned.
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
