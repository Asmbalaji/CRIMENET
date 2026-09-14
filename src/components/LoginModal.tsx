import React, { useState } from 'react';
import { Shield, Lock, KeyRound, Fingerprint, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (userRole: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [badgeId, setBadgeId] = useState('LEA-IND-9042');
  const [password, setPassword] = useState('••••••••••••');
  const [clearanceLevel, setClearanceLevel] = useState('LEVEL-5 (SPECIAL CELL)');
  const [authMethod, setAuthMethod] = useState<'BADGE' | 'BIOMETRIC'>('BADGE');
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(clearanceLevel);
  };

  const handleSimulateBiometric = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setTimeout(() => {
        onLoginSuccess('LEVEL-5 (BIOMETRIC VERIFIED)');
      }, 800);
    }, 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 17, 0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Background Cyber Grid Graphic */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel-glow"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '32px',
          position: 'relative',
          background: '#0c1324',
          borderRadius: '16px',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px var(--accent-cyan-glow)',
              marginBottom: '12px',
            }}
          >
            <Shield size={32} style={{ color: '#050811' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            CRIME<span style={{ color: 'var(--accent-cyan)' }}>NET</span> PORTAL
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            NATIONAL AI CRIMINAL NETWORK ANALYSIS SYSTEM
          </p>
          <span className="badge badge-cyan" style={{ marginTop: '8px' }}>
            SIH PROBLEM STATEMENT SIH26189
          </span>
        </div>

        {/* Auth Mode Toggle */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setAuthMethod('BADGE')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: authMethod === 'BADGE' ? 'var(--bg-surface)' : 'transparent',
              color: authMethod === 'BADGE' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <KeyRound size={14} /> Badge ID
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('BIOMETRIC')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: authMethod === 'BIOMETRIC' ? 'var(--bg-surface)' : 'transparent',
              color: authMethod === 'BIOMETRIC' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Fingerprint size={14} /> Biometric ID
          </button>
        </div>

        {authMethod === 'BADGE' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                LAW ENFORCEMENT BADGE ID
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  className="input-field"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  style={{ paddingLeft: '38px', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                ENCRYPTED SECURITY PASSPHRASE
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                CLEARANCE LEVEL
              </label>
              <select
                className="input-field"
                value={clearanceLevel}
                onChange={(e) => setClearanceLevel(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <option value="LEVEL-5 (SPECIAL CELL)">LEVEL-5 (SPECIAL CELL MASTER ACCESS)</option>
                <option value="LEVEL-4 (FINANCIAL INTEL)">LEVEL-4 (FINANCIAL INTEL)</option>
                <option value="LEVEL-3 (CRIME BRANCH)">LEVEL-3 (CRIME BRANCH FIELD OFFICER)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }}>
              Authenticate Clearance & Access Terminal
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              onClick={handleSimulateBiometric}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: scanning
                  ? 'rgba(0, 240, 255, 0.2)'
                  : scanned
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: scanning
                  ? '2px solid var(--accent-cyan)'
                  : scanned
                  ? '2px solid var(--accent-emerald)'
                  : '2px dashed var(--border-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '16px',
              }}
            >
              {scanned ? (
                <CheckCircle2 size={42} style={{ color: 'var(--accent-emerald)' }} />
              ) : (
                <Fingerprint
                  size={46}
                  style={{
                    color: scanning ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    animation: scanning ? 'pulse 1s infinite' : 'none',
                  }}
                />
              )}
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {scanning ? 'Verifying Neural Fingerprint Scan...' : scanned ? 'Biometric Authentication Approved!' : 'Click Scanner to Simulate Neural Scan'}
            </p>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              MATCHED WITH LEA BIOMETRIC VAULT #9042
            </p>
          </div>
        )}

        {/* Synthetic Notice Footer Banner */}
        <div
          style={{
            marginTop: '24px',
            padding: '12px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.7rem', color: '#fcd34d', fontFamily: 'var(--font-mono)' }}>
            <strong>DEMONSTRATION DISCLAIMER:</strong> This prototype runs exclusively on synthetic test datasets. No real personal or criminal data is processed.
          </div>
        </div>
      </div>
    </div>
  );
};
