import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, ViewId } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { NotificationDrawer } from './components/NotificationDrawer';

import { DashboardView } from './views/DashboardView';
import { CasesView } from './views/CasesView';
import { SuspectsView } from './views/SuspectsView';
import { NetworkAnalysisView } from './views/NetworkAnalysisView';
import { CrimeMapView } from './views/CrimeMapView';
import { AiInvestigationView } from './views/AiInvestigationView';
import { EvidenceView } from './views/EvidenceView';
import { ReportsView } from './views/ReportsView';
import { AlertsView } from './views/AlertsView';
import { SettingsView } from './views/SettingsView';

import {
  Suspect,
  InvestigationCase,
  TacticalAlert,
} from './data/mockData';
import { useData } from './context/DataContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function App() {
  const { alerts: fetchedAlerts, loading, error } = useData();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('LEVEL-5 (SPECIAL CELL)');
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [alerts, setAlerts] = useState<TacticalAlert[]>([]);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (fetchedAlerts.length > 0 && alerts.length === 0) {
      setAlerts(fetchedAlerts);
    }
  }, [fetchedAlerts]);

  // Selected State
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);
  const [networkEvidenceId, setNetworkEvidenceId] = useState<string | null>(null);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (role: string) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const handleMarkSingleAlertRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const handleNavigate = (view: ViewId, payload?: any) => {
    if (payload?.suspect) setSelectedSuspect(payload.suspect);
    if (payload?.case) setSelectedCase(payload.case);
    if (payload?.nodeId) setSelectedNodeId(payload.nodeId);
    if (payload?.location) setSelectedLocation(payload.location);
    if (payload?.evidence) setSelectedEvidence(payload.evidence);
    if (payload?.initialEvidenceId) setNetworkEvidenceId(payload.initialEvidenceId);
    
    // Explicitly clear specific states if navigating without them, 
    // or just let them persist (persisting is usually better for back-and-forth).
    setActiveView(view);
  };

  const getViewTitle = (view: ViewId): string => {
    switch (view) {
      case 'dashboard':
        return 'Investigation Command Center';
      case 'cases':
        return 'Active Case Dossiers';
      case 'suspects':
        return 'Suspect & HVT Directory';
      case 'network':
        return 'Criminal Network Topology';
      case 'map':
        return 'Geospatial Crime Hotspots';
      case 'ai':
        return 'NEXUS-AI Investigation Engine';
      case 'evidence':
        return 'Digital Forensics Vault';
      case 'reports':
        return 'Intelligence Report Builder';
      case 'alerts':
        return 'Real-time Tactical Alert Stream';
      case 'settings':
        return 'System Configuration';
      default:
        return 'Dashboard';
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <Loader2 size={48} className="radar-spinner" style={{ color: 'var(--accent-cyan)' }} />
        <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>INITIALIZING SECURE CONNECTION...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-red)' }} />
        <div style={{ color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>CONNECTION ERROR: {error}</div>
      </div>
    );
  }

  return (
    <div className="app-container print:block print:w-full">
      {!isAuthenticated && <LoginModal onLoginSuccess={handleLoginSuccess} />}

      {/* Main Left Sidebar */}
      <div className="print:hidden">
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => handleNavigate(v)}
          unreadAlertsCount={alerts.filter((a) => !a.read).length}
        />
      </div>

      {/* Main App Layout */}
      <div className="main-content print:w-full print:block print:m-0 print:p-0">
        <div className="print:hidden">
          <Header
            activeViewTitle={getViewTitle(activeView)}
            alerts={alerts}
            onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
            onLogout={handleLogout}
            userRole={userRole}
          />
        </div>

        {/* View Switcher Container */}
        <main className="view-container print:w-full print:block print:m-0 print:p-0">
          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              onSelectSuspect={setSelectedSuspect}
              onSelectCase={setSelectedCase}
            />
          )}

          {activeView === 'cases' && (
            <CasesView
              selectedCase={selectedCase}
              onSelectCase={setSelectedCase}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'suspects' && (
            <SuspectsView
              selectedSuspect={selectedSuspect}
              onSelectSuspect={setSelectedSuspect}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'network' && (
            <NetworkAnalysisView 
              initialSelectedNodeId={selectedNodeId}
              initialEvidenceId={networkEvidenceId}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'map' && (
            <CrimeMapView 
              onNavigate={handleNavigate}
              initialSelectedLocation={selectedLocation}
            />
          )}

          {activeView === 'ai' && (
            <AiInvestigationView 
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'evidence' && (
            <EvidenceView 
              onNavigate={handleNavigate}
              initialSelectedEvidence={selectedEvidence}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView 
              onNavigate={handleNavigate}
              selectedCase={selectedCase}
            />
          )}

          {activeView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onMarkRead={handleMarkSingleAlertRead}
              onNavigate={handleNavigate}
            />
          )}

          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onMarkAllRead={handleMarkAllAlertsRead}
      />
    </div>
  );
}

export default App;
