import { ViewId } from '../components/Sidebar';
import { TacticalAlert } from '../data/mockData';
import { CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

interface AlertsViewProps {
  alerts: TacticalAlert[];
  onMarkRead: (id: string) => void;
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onMarkRead, onNavigate }) => {
  const { cases, suspects, locations, evidence } = useData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
          Real-Time Tactical Threat Stream
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          LIVE DEMO ALERTS • GEOFENCE BREACHES • FINANCIAL ANOMALIES
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="glass-panel"
            style={{
              padding: '20px',
              borderLeft: alert.severity === 'CRITICAL' ? '4px solid var(--accent-red)' : '4px solid var(--accent-cyan)',
              background: alert.read ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className={alert.severity === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'}>
                  {alert.severity}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {alert.timestamp}
                </span>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {alert.category}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {alert.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {alert.message}
              </p>

              {/* Related Info Box */}
              <div style={{ padding: '10px', background: 'rgba(10,15,29,0.8)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                 {alert.relatedEntityId && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Entity:</span> <span style={{ color: 'var(--accent-cyan)' }}>{suspects.find(s => s.id === alert.relatedEntityId)?.name || alert.relatedEntityId}</span></div>
                 )}
                 {alert.relatedCaseId && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Case:</span> <span style={{ color: 'var(--accent-emerald)' }}>{cases.find(c => c.id === alert.relatedCaseId)?.caseNumber || alert.relatedCaseId}</span></div>
                 )}
                 {alert.locationId && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <span style={{ color: '#ffffff' }}>{locations.find(l => l.id === alert.locationId)?.city || alert.locationId}</span></div>
                 )}
                 {alert.evidenceId && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Evidence:</span> <span style={{ color: 'var(--accent-amber)' }}>{evidence.find(e => e.id === alert.evidenceId)?.title || alert.evidenceId}</span></div>
                 )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', marginLeft: '20px' }}>
              {!alert.read && (
                <button onClick={() => onMarkRead(alert.id)} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
                  <CheckCircle size={14} /> Mark Read
                </button>
              )}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {alert.relatedEntityId && (
                  <button 
                    onClick={() => onNavigate('suspects', { suspect: suspects.find(s => s.id === alert.relatedEntityId) })}
                    className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                    Inspect Entity
                  </button>
                )}
                {alert.relatedCaseId && (
                  <button 
                    onClick={() => onNavigate('cases', { case: cases.find(c => c.id === alert.relatedCaseId) })}
                    className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                    Open Case
                  </button>
                )}
                {alert.relatedEntityId && (
                  <button 
                    onClick={() => onNavigate('network', { nodeId: alert.relatedEntityId })}
                    className="btn btn-danger" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                    View Network
                  </button>
                )}
                {alert.evidenceId && (
                  <button 
                    onClick={() => onNavigate('evidence', { evidenceId: alert.evidenceId })}
                    className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px', borderColor: 'var(--accent-amber)' }}>
                    View Evidence
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
