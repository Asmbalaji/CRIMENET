import React, { useState } from 'react';
import {
  UserX,
  Search,
  Fingerprint,
  Phone,
  MapPin,
  Shield,
  Activity,
  Award,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Suspect } from '../data/mockData';
import { useData } from '../context/DataContext';

import { ViewId } from '../components/Sidebar';

interface SuspectsViewProps {
  selectedSuspect: Suspect | null;
  onSelectSuspect: (suspect: Suspect | null) => void;
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const SuspectsView: React.FC<SuspectsViewProps> = ({ selectedSuspect, onSelectSuspect, onNavigate }) => {
  const { suspects, cases, evidence } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');

  const getDisplayName = (s: Suspect) => {
    let resolved = s.name || s.displayName || s.fullName;
    
    // If name is redacted or missing, try to use the associated case name for public records
    if (!resolved || resolved.toLowerCase() === 'redacted' || resolved === 'Name Redacted') {
      const associatedCase = cases.find(c => c.suspectIds.includes(s.id));
      if (associatedCase && associatedCase.isPublicRecord) {
        return associatedCase.title;
      }
      resolved = "Public Case Entity";
    }
    return resolved;
  };

  const filteredSuspects = suspects.filter((s) => {
    const resolvedName = getDisplayName(s);
    const matchesSearch =
      resolvedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.syndicate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesThreat = threatFilter === 'ALL' || s.threatLevel === threatFilter;
    return matchesSearch && matchesThreat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            Suspects & High-Value Targets (HVTs)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            SYNTHETIC IDENTITY DATABASE • 6 TRACKED INDIVIDUALS
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search Suspect Name or Alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.8rem' }}
            />
          </div>

          <select
            className="input-field"
            value={threatFilter}
            onChange={(e) => setThreatFilter(e.target.value)}
            style={{ width: '150px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
          >
            <option value="ALL">All Threat Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Grid of Suspect Profiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredSuspects.map((suspect) => {
          const displayName = getDisplayName(suspect);
          return (
          <div
            key={suspect.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: selectedSuspect?.id === suspect.id ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => onSelectSuspect(suspect)}
          >
            <div>
              {/* Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {suspect.id}
                </span>
                <span className={suspect.threatLevel === 'CRITICAL' ? 'badge badge-critical' : suspect.threatLevel === 'HIGH' ? 'badge badge-high' : 'badge badge-medium'}>
                  {suspect.threatLevel}
                </span>
              </div>

              {/* Profile Card Main */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: suspect.avatarColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    boxShadow: `0 0 20px ${suspect.avatarColor}40`,
                  }}
                >
                  {displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    {displayName}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {suspect.syndicate === 'Public Record' ? 'Public Case Record' : `Alias: "${suspect.alias}"`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {suspect.syndicate === 'Public Record' ? 'Accused / Case Entity' : suspect.role}
                  </div>
                </div>
              </div>

              {/* Threat Meter Progress Bar */}
              <div style={{ marginBottom: '16px', background: 'rgba(10,15,29,0.8)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                  <span>ANALYTICAL CASE PRIORITY</span>
                  <span style={{ color: suspect.riskScore > 85 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                    {suspect.riskScore}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${suspect.riskScore}%`,
                      height: '100%',
                      background: suspect.riskScore > 85 ? 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)' : 'linear-gradient(90deg, #eab308 0%, #f97316 100%)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              {/* Location & Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: 'var(--accent-amber)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{suspect.lastKnownLocation}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span>{suspect.phone}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                STATUS: {suspect.status}
              </span>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                View Full Dossier
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Suspect Detail Modal Drawer */}
      {selectedSuspect && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 95,
            background: 'rgba(5, 8, 17, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => onSelectSuspect(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              height: '100vh',
              borderRadius: 0,
              borderLeft: '1px solid var(--border-cyan)',
              background: '#0a0f1d',
              padding: '32px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: selectedSuspect.avatarColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {getDisplayName(selectedSuspect).substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                    {getDisplayName(selectedSuspect)}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {selectedSuspect.syndicate === 'Public Record' ? 'Public Case Record' : `Alias: "${selectedSuspect.alias}"`}
                  </div>
                  {selectedSuspect.syndicate === 'Public Record' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      Case Reference:<br/>{selectedSuspect.alias}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => onSelectSuspect(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Identity Verification Panel */}
            <div style={{ padding: '20px', background: 'rgba(15,23,42,0.9)', borderRadius: '12px', border: '1px solid var(--border-cyan)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                <Fingerprint size={18} /> SYNTHETIC IDENTITY MATCH DATA
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Facial Recognition Match:</span>
                  <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '2px' }}>
                    {selectedSuspect.biometrics.facialMatchScore}% Certainty
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DNA Registry Match:</span>
                  <div style={{ color: selectedSuspect.biometrics.dnaMatched ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 700, marginTop: '2px' }}>
                    {selectedSuspect.biometrics.dnaMatched ? 'VERIFIED MATCH' : 'NO RECORD'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Fingerprint Record:</span>
                  <div style={{ color: selectedSuspect.biometrics.fingerprintRegistered ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>
                    {selectedSuspect.biometrics.fingerprintRegistered ? 'REGISTERED' : 'UNREGISTERED'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Primary Syndicate:</span>
                  <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                    {selectedSuspect.syndicate}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factor Breakdown */}
            <div style={{ padding: '20px', background: 'rgba(15,23,42,0.9)', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                <Activity size={18} /> ANALYTICAL CASE PRIORITY
              </h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
                {selectedSuspect.riskScore}% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'var(--font-sans)' }}>Analytical Priority Indicator</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                {selectedSuspect.riskFactors && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Network Centrality:</span>
                      <span style={{ color: 'var(--accent-cyan)' }}>{selectedSuspect.riskFactors.centrality}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Case Severity:</span>
                      <span style={{ color: 'var(--accent-red)' }}>{selectedSuspect.riskFactors.severity}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Communication Pattern:</span>
                      <span style={{ color: 'var(--accent-amber)' }}>{selectedSuspect.riskFactors.communication}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Financial Pattern:</span>
                      <span style={{ color: 'var(--accent-emerald)' }}>{selectedSuspect.riskFactors.financial}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Location Association:</span>
                      <span style={{ color: 'var(--accent-blue)' }}>{selectedSuspect.riskFactors.location}%</span>
                    </div>
                  </>
                )}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
                *Analytical indicator for investigation workflow only; not a determination of guilt.
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => {
                  onSelectSuspect(null);
                  onNavigate('network', { nodeId: selectedSuspect.id });
                }}
                className="btn btn-danger" style={{ width: '100%' }}>
                View in Network Graph
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                 <button 
                   onClick={() => {
                     onSelectSuspect(null);
                     onNavigate('cases', { case: cases.find(c => selectedSuspect.associatedCaseIds.includes(c.id)) });
                   }}
                   className="btn btn-secondary">
                   Related Cases
                 </button>
                 <button 
                   onClick={() => {
                     onSelectSuspect(null);
                     const evidenceItem = evidence.find(e => selectedSuspect.associatedCaseIds.includes(e.caseId));
                     onNavigate('evidence', { evidence: evidenceItem });
                   }}
                   className="btn btn-secondary">
                   Correlated Evidence
                 </button>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onSelectSuspect(null)}>
              Close Suspect File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
