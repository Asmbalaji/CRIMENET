import React from 'react';
import {
  FolderKanban,
  UserX,
  Network,
  MapPin,
  ShieldAlert,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Activity,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import {
  Suspect,
  InvestigationCase,
} from '../data/mockData';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';

interface DashboardViewProps {
  onNavigate: (view: ViewId, payload?: any) => void;
  onSelectSuspect: (suspect: Suspect) => void;
  onSelectCase: (c: InvestigationCase) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectSuspect,
  onSelectCase,
}) => {
  const { suspects, cases, locations, networkNodes, networkEdges } = useData();
  const highRiskSuspects = suspects.filter((s) => s.riskScore >= 80);
  const activeCases = cases.filter((c) => c.status === 'ACTIVE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Alert Notice */}
      {highRiskSuspects.length > 0 && (
        <div
          className="glass-panel-glow"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(15,23,42,0.9) 100%)',
            borderColor: 'rgba(239,68,68,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '10px', background: 'rgba(239,68,68,0.2)', borderRadius: '10px' }}>
              <ShieldAlert size={24} style={{ color: 'var(--accent-red)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                HIGH PRIORITY THREAT ALERT: {highRiskSuspects[0].id} ({highRiskSuspects[0].name.toUpperCase()}) DETECTED
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                System indicates severe threat potential based on dynamic network analysis.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectSuspect(highRiskSuspects[0])}
            className="btn btn-danger"
            style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          >
            Inspect Target <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* 4 Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1: Active Cases */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ACTIVE INVESTIGATIONS
            </span>
            <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', color: 'var(--accent-blue)' }}>
              <FolderKanban size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
            {activeCases.length.toString().padStart(2, '0')} <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>/ {cases.length} Total</span>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--accent-emerald)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Sync active
          </div>
        </div>

        {/* Card 2: Tracked HVTs */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              TRACKED HVTs & SUSPECTS
            </span>
            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', color: 'var(--accent-red)' }}>
              <UserX size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
            {suspects.length.toString().padStart(2, '0')} <span style={{ fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 500 }}>{highRiskSuspects.length} Critical</span>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Biometric Records Analyzed
          </div>
        </div>

        {/* Card 3: Network Central Nodes */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              NETWORK ENTITIES & NODES
            </span>
            <div style={{ padding: '8px', background: 'rgba(0, 240, 255, 0.15)', borderRadius: '8px', color: 'var(--accent-cyan)' }}>
              <Network size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
            {networkNodes.length.toString().padStart(2, '0')} <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 500 }}>{networkNodes.length > 0 ? 'Inter-links' : 'Empty'}</span>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--accent-cyan)', marginTop: '8px' }}>
            Dynamic Force Graph Status
          </div>
        </div>

        {/* Card 4: Spatial Crime Hotspots */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              GEOSPATIAL HOTSPOTS
            </span>
            <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: 'var(--accent-amber)' }}>
              <MapPin size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
            {locations.length.toString().padStart(2, '0')} <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 500 }}>Locations</span>
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {locations.length > 0 ? locations.map(l => l.city).join(', ') : 'No location data'}
          </div>
        </div>
      </div>

      {/* Main Grid Section: Network & Crime Map Interactive Previews */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* Network Graph Interactive Card Placeholder */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="card-title">
              <Network size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>Syndicate Network Topology</span>
            </div>
            <button onClick={() => onNavigate('network')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
              Full Interactive Graph <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Graphical Mock Render */}
          <div
            style={{
              flex: 1,
              minHeight: '260px',
              background: '#070b14',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {networkNodes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>NO VERIFIED NETWORK RELATIONSHIPS</div>
                <div style={{ fontSize: '0.75rem' }}>Create a case with verified entity relationships to populate Network Analysis.</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>{networkNodes.length} NODES & {networkEdges.length} EDGES DYNAMICALLY LOADED</div>
                <div style={{ fontSize: '0.75rem' }}>Click "Full Interactive Graph" to open Analysis.</div>
              </div>
            )}

            <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(10,15,29,0.85)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              ● {networkNodes.length} Network Entities • {networkEdges.length} Relations • Dynamic Topology
            </div>
          </div>
        </div>

        {/* Crime Location Map Card Placeholder */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="card-title">
              <MapPin size={20} style={{ color: 'var(--accent-amber)' }} />
              <span>National Spatial Threat Matrix</span>
            </div>
            <button onClick={() => onNavigate('map')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
              Open Tactical Map <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Map Preview Canvas */}
          <div
            style={{
              flex: 1,
              minHeight: '260px',
              background: '#060a14',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Simulated Radar Vector Grid */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.05) 0%, transparent 80%)' }} />

            {/* Simulated Map Markers */}
            {locations.map((loc, idx) => (
              <div
                key={loc.id}
                style={{
                  position: 'absolute',
                  top: `${25 + idx * 15}%`,
                  left: `${20 + idx * 16}%`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('map')}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: loc.threatLevel === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-amber)', boxShadow: `0 0 10px ${loc.threatLevel === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-amber)'}` }} />
                <span style={{ fontSize: '0.68rem', background: 'rgba(15,23,42,0.9)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {loc.city.split(',')[0]}
                </span>
              </div>
            ))}

            <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(10,15,29,0.85)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              {locations.length} Hotspots Mapped
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: High Risk Entities Watchlist & Recent Cases */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* High Risk Entities Watchlist */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="card-title">
              <UserX size={20} style={{ color: 'var(--accent-red)' }} />
              <span>High-Risk Entities Watchlist</span>
            </div>
            <button onClick={() => onNavigate('suspects')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              View All ({suspects.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {highRiskSuspects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>NO VERIFIED ENTITIES</div>
                <div style={{ fontSize: '0.7rem' }}>Upload and verify a case document to identify suspects.</div>
              </div>
            ) : (
              highRiskSuspects.map((suspect) => (
                <div
                  key={suspect.id}
                  onClick={() => onNavigate('suspects', { suspect })}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: suspect.avatarColor,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {suspect.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                        {suspect.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({suspect.alias})</span>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {suspect.role} • {suspect.syndicate}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={suspect.threatLevel === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'}>
                      RISK {suspect.riskScore}%
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      {suspect.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Cases Stream */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="card-title">
              <FolderKanban size={20} style={{ color: 'var(--accent-blue)' }} />
              <span>Active Investigation Cases</span>
            </div>
            <button onClick={() => onNavigate('cases')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              Cases Board
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeCases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>NO INVESTIGATION CASES AVAILABLE</div>
                <div style={{ fontSize: '0.7rem' }}>Upload and verify a case document to create a case.</div>
              </div>
            ) : (
              activeCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate('cases', { case: c })}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {c.caseNumber}
                    </span>
                    <span className={c.severity === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'}>
                      {c.severity}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                    {c.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.summary}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>Officer: {c.leadOfficer}</span>
                    <span>{c.evidenceCount} Evidence files</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
