import React, { useState } from 'react';
import { FileText, Download, Printer, Shield, CheckCircle, Award } from 'lucide-react';
import { InvestigationCase } from '../data/mockData';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';

interface ReportsViewProps {
  selectedCase: InvestigationCase | null;
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ selectedCase, onNavigate }) => {
  const { cases, suspects } = useData();
  const [selectedCaseId, setSelectedCaseId] = useState(selectedCase?.id || cases[0]?.id);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const linkedSuspects = suspects.filter((s) => currentCase?.suspectIds.includes(s.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            Automated Intelligence Dossier Generator
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            EXECUTIVE LAW ENFORCEMENT SUMMARY REPORT • SIH DEMO EXPORT
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="input-field"
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            style={{ width: '280px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.title.substring(0, 30)}...
              </option>
            ))}
          </select>

          <button onClick={handlePrint} className="btn btn-primary print:hidden" style={{ fontSize: '0.8rem' }}>
            <Printer size={16} /> Print / Export Dossier PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        className="glass-panel print:bg-white print:text-black print:block print:w-full"
        style={{
          padding: '40px',
          background: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #94a3b8',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          color: '#0f172a'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #334155', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', fontFamily: 'var(--font-mono)' }}>
              NATIONAL INTELLIGENCE GRID • RESTRICTED CLASSIFIED REPORT
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              CRIMENET DOSSIER: {currentCase.caseNumber}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px', fontWeight: 600 }}>
              Target Syndicate: <strong>{currentCase.syndicate}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
            <div>DATE: {new Date().toLocaleDateString()}</div>
            <div>STATUS: {currentCase.status}</div>
            <div>SEVERITY: {currentCase.severity}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
            1. EXECUTIVE BRIEF
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, fontWeight: 500 }}>
            {currentCase.summary}
          </p>
        </div>

        {/* Target Suspect Profiles */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
            2. LINKED PRIMARY SUSPECTS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {linkedSuspects.map((s) => (
              <div key={s.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{s.name} ({s.alias})</strong>
                  <div style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '4px', fontWeight: 600 }}>Role: {s.role}</div>
                </div>
                <span className={s.threatLevel === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'}>
                  THREAT SCORE {s.riskScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI & Network Analysis Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
            3. AI INTELLIGENCE & NETWORK CORRELATION
          </h3>
          <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '4px', border: '1px solid #16a34a', fontSize: '0.85rem', color: '#064e3b', fontWeight: 500 }}>
            <p style={{ marginBottom: '10px' }}><strong>System Finding:</strong> Neural networks have identified highly centralized communication patterns indicating coordinated activities among the primary suspects. <strong>{currentCase.evidenceCount}</strong> pieces of supporting digital evidence have been correlated to this cluster.</p>
            <p><strong>Recommended Action:</strong> Initiate Level 5 Field Surveillance and coordinate with cross-jurisdictional cyber units based on {currentCase.location} hotspot analysis.</p>
          </div>
        </div>

        {/* Footer Authorization Stamp */}
        <div style={{ borderTop: '2px solid #94a3b8', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          <div>GENERATED BY: CRIMENET AI SYSTEM (SIH26189)</div>
          <div>CONFIDENTIALITY: LEVEL-5 LAW ENFORCEMENT ONLY</div>
        </div>
      </div>
    </div>
  );
};
