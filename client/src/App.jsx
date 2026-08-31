import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import StartupsList from './pages/StartupsList';
import StartupDetail from './pages/StartupDetail';
import StartupModal from './components/startup/StartupModal';
import ExcelUploadModal from './components/startup/ExcelUploadModal';
import IntakeChoiceModal from './components/startup/IntakeChoiceModal';
import startupService from './services/startupService';

function AppContent() {
  const navigate = useNavigate();
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ totalStartups: 0 });

  // Load high-level stats for sidebar badge
  const loadStats = async () => {
    try {
      const data = await startupService.getDashboardMetrics();
      if (data) {
        setStats({ totalStartups: data.totalStartups });
      }
    } catch (err) {
      console.warn('Could not load sidebar stats:', err.message);
    }
  };

  useEffect(() => {
    loadStats();

    const handleRefreshStats = () => loadStats();
    window.addEventListener('startup-created', handleRefreshStats);
    return () => window.removeEventListener('startup-created', handleRefreshStats);
  }, []);

  const handleGlobalCreateStartup = async (payload) => {
    try {
      setActionLoading(true);
      const created = await startupService.createStartup(payload);
      setIsManualModalOpen(false);
      await loadStats();
      window.dispatchEvent(new CustomEvent('startup-created'));

      // Redirect straight into Startup Detail workspace for the new record
      if (created?._id) {
        navigate(`/startups/${created._id}`);
      }
    } catch (err) {
      console.error('Error creating startup:', err);
      alert(err.message || 'Failed to create startup');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout
      onOpenAddModal={() => setIsChoiceModalOpen(true)}
      stats={stats}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard onOpenAddModal={() => setIsChoiceModalOpen(true)} />
          }
        />
        <Route
          path="/startups"
          element={
            <StartupsList
              onOpenAddModal={() => setIsChoiceModalOpen(true)}
              onOpenExcelModal={() => setIsExcelModalOpen(true)}
            />
          }
        />
        <Route path="/startups/:id" element={<StartupDetail />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 1. Intake Choice Modal (Choose Manual vs Upload Directly) */}
      <IntakeChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onSelectManual={() => setIsManualModalOpen(true)}
        onSelectUpload={() => setIsExcelModalOpen(true)}
      />

      {/* 2. Manual Step-by-Step Intake Modal */}
      <StartupModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleGlobalCreateStartup}
        loading={actionLoading}
      />

      {/* 3. Direct Excel / CSV Upload Modal */}
      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportSuccess={async () => {
          await loadStats();
        }}
      />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
