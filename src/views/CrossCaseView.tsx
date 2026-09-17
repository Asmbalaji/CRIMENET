import React, { useState } from 'react';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';
import { CheckCircle, XCircle, Link as LinkIcon, FileText, AlertTriangle, User } from 'lucide-react';
import { CrossCaseLink } from '../data/mockData';

interface CrossCaseViewProps {
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const CrossCaseView: React.FC<CrossCaseViewProps> = ({ onNavigate }) => {
  const { crossCaseLinks, cases, suspects, refreshData } = useData();
  const [verifying, setVerifying] = useState<string | null>(null);

  const pendingLinks = crossCaseLinks.filter(l => l.status === 'PENDING');
  const verifiedLinks = crossCaseLinks.filter(l => l.status === 'VERIFIED');

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setVerifying(id);
    try {
      await fetch(`http://localhost:5000/api/cross-case-links/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to verify link', err);
    } finally {
      setVerifying(null);
    }
  };

  const getCaseNumber = (id: string) => cases.find(c => c.id === id)?.caseNumber || id;
  const getEntityName = (id?: string) => suspects.find(s => s.id === id)?.name || id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
          Cross-Case Intelligence
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          AI-DETECTED RELATIONSHIPS ACROSS MULTIPLE INVESTIGATIONS
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-amber)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          PENDING HUMAN REVIEW ({pendingLinks.length})
        </h3>
        
        {pendingLinks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(10,15,29,0.5)', borderRadius: '8px' }}>
            <CheckCircle size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p>No pending cross-case relationships require review.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {pendingLinks.map(link => (
              <div key={link.id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-amber)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LinkIcon size={16} style={{ color: 'var(--accent-amber)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-mono)' }}>{link.relationshipType}</span>
                  </div>
                  <span className="badge badge-high">{link.confidence}% CONFIDENCE</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: 'rgba(15,23,42,0.8)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-cyan)', flex: 1, textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    {getCaseNumber(link.sourceCaseId)}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>⇄</div>
                  <div style={{ background: 'rgba(15,23,42,0.8)', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-cyan)', flex: 1, textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    {getCaseNumber(link.targetCaseId)}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {link.reason}
                </p>

                {link.supportingEntityId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <User size={12} /> Supporting Entity: <strong style={{ color: '#fff' }}>{getEntityName(link.supportingEntityId)}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleVerify(link.id, 'VERIFIED')}
                    disabled={verifying === link.id}
                    className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>
                    <CheckCircle size={14} /> Verify Link
                  </button>
                  <button 
                    onClick={() => handleVerify(link.id, 'REJECTED')}
                    disabled={verifying === link.id}
                    className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          VERIFIED CONNECTIONS ({verifiedLinks.length})
        </h3>
        
        {verifiedLinks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(10,15,29,0.5)', borderRadius: '8px' }}>
            <LinkIcon size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p>No cross-case relationships have been verified yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {verifiedLinks.map(link => (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(15,23,42,0.6)', borderLeft: '3px solid var(--accent-emerald)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{getCaseNumber(link.sourceCaseId)} ⇄ {getCaseNumber(link.targetCaseId)}</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{link.relationshipType}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{link.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
