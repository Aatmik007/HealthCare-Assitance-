import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const HealthcareContext = createContext(null);

export const HealthcareProvider = ({ children }) => {
  const [vitals, setVitals] = useState([]);
  const [reports, setReports] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/vitals');
      setVitals(res.data);
    } catch (err) {
      console.error('Error fetching vitals:', err);
      setError(err.response?.data?.message || 'Failed to retrieve vitals.');
    } finally {
      setLoading(false);
    }
  };

  const logVitals = async (vitalData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/vitals', vitalData);
      setVitals(prev => [res.data.vital, ...prev]);
      // Refresh recommendations since new vitals are logged
      fetchRecommendations();
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Error logging vitals:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to log vitals.' };
    } finally {
      setLoading(false);
    }
  };

  const clearVitals = async () => {
    try {
      await axios.delete('/api/vitals');
      setVitals([]);
      fetchRecommendations();
      return true;
    } catch (err) {
      console.error('Error clearing vitals:', err);
      return false;
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to retrieve reports.');
    } finally {
      setLoading(false);
    }
  };

  const uploadReport = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setReports(prev => [res.data.report, ...prev]);
      // Refresh recommendations since new report is uploaded
      fetchRecommendations();
      return { success: true, report: res.data.report };
    } catch (err) {
      console.error('Error uploading report:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to upload report.' };
    } finally {
      setLoading(false);
    }
  };

  const clearReports = async () => {
    try {
      await axios.delete('/api/reports');
      setReports([]);
      fetchRecommendations();
      return true;
    } catch (err) {
      console.error('Error clearing reports:', err);
      return false;
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get('/api/recommendations');
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Error generating recommendations:', err);
    }
  };

  const getPrediction = async (symptomIndices, classifier = 'random_forest') => {
    setLoading(true);
    setPrediction(null);
    try {
      const res = await axios.post('/api/symptoms/predict', { symptomIndices, classifier });
      setPrediction(res.data);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Symptom prediction error:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to run symptom analysis.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <HealthcareContext.Provider value={{
      vitals,
      reports,
      recommendations,
      prediction,
      loading,
      error,
      fetchVitals,
      logVitals,
      clearVitals,
      fetchReports,
      uploadReport,
      clearReports,
      fetchRecommendations,
      getPrediction,
      setPrediction
    }}>
      {children}
    </HealthcareContext.Provider>
  );
};

export const useHealthcare = () => useContext(HealthcareContext);
export default HealthcareContext;
