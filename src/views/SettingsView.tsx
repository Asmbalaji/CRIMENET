import React, { useState } from 'react';
import { Settings, Sliders, Database, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [threatSensitivity, setThreatSensitivity] = useState('HIGH');
  const [syntheticMode, setSyntheticMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
          System Configuration & AI Model Controls
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          SIH26189 PROTOTYPE SYSTEM SETTINGS
        </p>
      </div>

      {/* Settings Card */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* AI Confidence Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              AI Link Prediction Confidence Threshold
            </label>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {confidenceThreshold}% Minimum
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            Only edges and relationships with confidence rating above threshold will be rendered in graph analysis.
          </p>
        </div>

        {/* Threat Sensitivity Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            Real-time Threat Ticker Sensitivity
          </label>
          <select
            className="input-field"
            value={threatSensitivity}
            onChange={(e) => setThreatSensitivity(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <option value="MAXIMUM">MAXIMUM (Flag all CDR anomalies & ANPR hits)</option>
            <option value="HIGH">HIGH (Standard Law Enforcement Operational Level)</option>
            <option value="BALANCED">BALANCED (High-Value Target Movement Only)</option>
          </select>
        </div>

        {/* Synthetic Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(10,15,29,0.8)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              Synthetic Dataset Mode
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Enforces non-production mock environment for Hackathon compliance.
            </p>
          </div>
          <span className="badge badge-emerald">ACTIVE (DEMO ONLY)</span>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '12px' }}>
          {saved ? <CheckCircle2 size={18} /> : <Settings size={18} />}
          {saved ? 'Configuration Saved!' : 'Save System Configuration'}
        </button>
      </div>
    </div>
  );
};
