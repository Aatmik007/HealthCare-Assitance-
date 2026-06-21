import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthcareProvider } from './context/HealthcareContext';
import Sidebar from './components/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Vitals from './pages/Vitals';
import SymptomChecker from './pages/SymptomChecker';
import Reports from './pages/Reports';
import Recommendations from './pages/Recommendations';

const MainLayout = () => {
  const { token, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--bg-deep))]">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/10 border-t-cyan-400 animate-spin"></div>
        </div>
      </div>
    );
  }

  // Render Auth if not logged in
  if (!token) {
    return <Auth />;
  }

  // Page selection router mapping
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'vitals':
        return <Vitals />;
      case 'symptoms':
        return <SymptomChecker />;
      case 'reports':
        return <Reports />;
      case 'recommendations':
        return <Recommendations />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      {/* Main Content Area */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );

};

const App = () => {
  return (
    <AuthProvider>
      <HealthcareProvider>
        <MainLayout />
      </HealthcareProvider>
    </AuthProvider>
  );
};

export default App;
