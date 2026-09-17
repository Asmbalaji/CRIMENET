import React, { useState } from 'react';
import { HardDrive, Search, Filter, PhoneCall, DollarSign, Camera, FileCode, CheckCircle, Shield, FolderSearch } from 'lucide-react';
import { EvidenceItem } from '../data/mockData';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';

interface EvidenceViewProps {
  initialSelectedEvidence?: EvidenceItem | null;
  onNavigate: (view: ViewId, payload?: any) => void;
}
export const EvidenceView: React.FC<EvidenceViewProps> = ({ initialSelectedEvidence, onNavigate }) => {
  const { cases, evidence } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  const initialItem = initialSelectedEvidence 
    ? evidence.find(e => e.id === initialSelectedEvidence.id) || (evidence.length > 0 ? evidence[0] : null)
    : (evidence.length > 0 ? evidence[0] : null);
    
  const [activeItem, setActiveItem] = useState<any>(initialItem);

  const filteredEvidence = evidence.filter(
    (e) => selectedCategory === 'ALL' || e.category === selectedCategory
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            Digital Forensic Evidence Vault
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            CDR INTERCEPTS • FINANCIAL HAWALA LEDGERS • ANPR SCANS
          </p>
        </div>

        {/* Filters */}
        <select
          className="input-field"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: '220px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
        >
          <option value="ALL">All Categories</option>
          <option value="CDR_LOG">CDR Call Detail Records</option>
          <option value="FINANCIAL">Financial Ledger</option>
          <option value="SURVEILLANCE">Surveillance</option>
          <option value="BIOMETRIC">Facial Biometrics</option>
          <option value="CYBER">Cyber</option>
          <option value="GEO_INT">Geo Intel</option>
          <option value="DOCUMENT">Document</option>
          <option value="AUDIO_LOG">Audio Log</option>
          <option value="LOGISTICS">Logistics</option>
        </select>
      </div>

      {/* Grid: List + Detail Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', minHeight: 0, flex: 1 }}>
        {/* List of Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredEvidence.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <FolderSearch size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>NO EVIDENCE DOCUMENTS AVAILABLE</div>
              <div style={{ fontSize: '0.85rem' }}>Upload a case document to populate the Evidence Vault.</div>
            </div>
          ) : (
            filteredEvidence.map((item) => {
              const isSelected = activeItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    border: isSelected ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? '0 0 15px var(--accent-cyan-glow)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onClick={() => setActiveItem(item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {item.id}
                    </span>
                    <span className="badge badge-emerald">
                      CONFIDENCE {item.confidence}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Source: {item.source} • {item.timestamp}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Evidence Forensics Inspector */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {activeItem ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="badge badge-cyan">{activeItem.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Case ID: {activeItem.caseId}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                {activeItem.title}
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {activeItem.summary}
              </p>

              {/* Metadata forencsic key-value table */}
              <div style={{ background: 'rgba(10,15,29,0.9)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                  FORENSIC METADATA ATTRIBUTES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeItem.metadata && Object.entries(activeItem.metadata).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{val as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Entities & Navigation */}
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(15,23,42,0.9)', borderRadius: '10px', border: '1px solid var(--border-cyan)' }}>
                <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                  ASSOCIATED ENTITIES & INVESTIGATION
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => onNavigate('cases', { case: cases.find(c => c.id === activeItem.caseId) })}
                    className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }}>
                    Open Related Case
                  </button>
                  <button 
                    onClick={() => onNavigate('network', { initialEvidenceId: activeItem.id })} 
                    className="btn btn-danger" style={{ flex: 1, fontSize: '0.8rem' }}>
                    View Network Links
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              Select an evidence file from the vault list to view forensics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
