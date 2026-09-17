import React, { useState } from 'react';
import { X, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

interface VerificationModalProps {
  extractedData: any;
  onConfirm: (verifiedData: any) => void;
  onCancel: () => void;
}

export const CaseVerificationModal: React.FC<VerificationModalProps> = ({ extractedData, onConfirm, onCancel }) => {
  const [data, setData] = useState<any>(extractedData);

  const handleChange = (section: string, field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: string, index: number, field: string, value: string) => {
    setData((prev: any) => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(5, 8, 17, 0.95)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
    }}>
      <div className="glass-panel" style={{
        width: '100%', maxWidth: '800px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)',
        borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-cyan)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={24} style={{ color: 'var(--accent-cyan)' }} /> Review Extracted Case Information
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Verify AI-extracted details before creating the official case record.
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Confidence Notice */}
          <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', border: '1px solid var(--border-cyan)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>Overall Extraction Confidence: {data.confidence?.overall || 0}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fields may contain inaccuracies. Please review all details manually.</div>
            </div>
          </div>

          {/* Case Information */}
          <section>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>CASE INFORMATION</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Case Title</label>
                <input type="text" className="input-field" style={{ width: '100%' }} value={data.case?.caseTitle || ''} onChange={e => handleChange('case', 'caseTitle', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FIR Number</label>
                <input type="text" className="input-field" style={{ width: '100%' }} value={data.case?.firNumber || ''} onChange={e => handleChange('case', 'firNumber', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Case Number</label>
                <input type="text" className="input-field" style={{ width: '100%' }} value={data.case?.caseNumber || ''} onChange={e => handleChange('case', 'caseNumber', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Police Station</label>
                <input type="text" className="input-field" style={{ width: '100%' }} value={data.case?.policeStation || ''} onChange={e => handleChange('case', 'policeStation', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>District</label>
                <input type="text" className="input-field" style={{ width: '100%' }} value={data.case?.district || ''} onChange={e => handleChange('case', 'district', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FIR Date</label>
                <input type="text" className="input-field" style={{ width: '100%' }} value={data.case?.firDate || ''} onChange={e => handleChange('case', 'firDate', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Case Description / Summary</label>
              <textarea className="input-field" style={{ width: '100%', minHeight: '80px', padding: '8px' }} value={data.summary || ''} onChange={e => setData({...data, summary: e.target.value})} />
            </div>
          </section>

          {/* Persons */}
          {data.persons && data.persons.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>PERSONS IDENTIFIED</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.persons.map((p: any, idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Name</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={p.name || ''} onChange={e => handleArrayChange('persons', idx, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Role</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={p.role || ''} onChange={e => handleArrayChange('persons', idx, 'role', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Source Pages</label>
                      <div style={{ color: '#fff', fontSize: '0.8rem', padding: '6px' }}>{p.sourcePages?.join(', ') || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Locations */}
          {data.locations && data.locations.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>LOCATIONS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.locations.map((loc: any, idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Name</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={loc.name || ''} onChange={e => handleArrayChange('locations', idx, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Type</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={loc.type || ''} onChange={e => handleArrayChange('locations', idx, 'type', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Source Pages</label>
                      <div style={{ color: '#fff', fontSize: '0.8rem', padding: '6px' }}>{loc.sourcePages?.join(', ') || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Evidence */}
          {data.evidence && data.evidence.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>EVIDENCE</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.evidence.map((ev: any, idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Description</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={ev.description || ''} onChange={e => handleArrayChange('evidence', idx, 'description', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Type</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={ev.type || ''} onChange={e => handleArrayChange('evidence', idx, 'type', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Source Pages</label>
                      <div style={{ color: '#fff', fontSize: '0.8rem', padding: '6px' }}>{ev.sourcePages?.join(', ') || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Relationships */}
          {data.relationships && data.relationships.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>RELATIONSHIPS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.relationships.map((rel: any, idx: number) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Source Person</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={rel.source || ''} onChange={e => handleArrayChange('relationships', idx, 'source', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Relationship</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={rel.relationship || ''} onChange={e => handleArrayChange('relationships', idx, 'relationship', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Target Person</label>
                      <input type="text" className="input-field" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }} value={rel.target || ''} onChange={e => handleArrayChange('relationships', idx, 'target', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Action Bar */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'rgba(5, 8, 17, 0.5)' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onConfirm(data)}>
            <CheckCircle2 size={18} /> Confirm & Create Case
          </button>
        </div>
      </div>
    </div>
  );
};
