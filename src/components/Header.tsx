import React from 'react';
import { Search, ShieldAlert, Bell, LogOut, User, Lock, Activity } from 'lucide-react';
import { TacticalAlert } from '../data/mockData';

interface HeaderProps {
  activeViewTitle: string;
  alerts: TacticalAlert[];
  onOpenAlerts: () => void;
  onLogout: () => void;
  userRole: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeViewTitle,
  alerts,
  onOpenAlerts,
  onLogout,
  userRole,
}) => {
  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <header className="glass-panel" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 30 }}>
      {/* View Title & Active System Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {activeViewTitle}
            </span>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
              SIH26189 LIVE DEMO
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            NATIONAL INTELLIGENCE GRID • SYNTHETIC ENVIRONMENT v2.4
          </p>
        </div>
      </div>

      {/* Global Intel Search */}
      <div style={{ flex: 1, maxWidth: '460px', margin: '0 24px', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)' }} />
        <input
          type="text"
          className="input-field"
          placeholder="Search Suspect Name, Alias, Case ID, Burner SIM or HVT Hash..."
          style={{ paddingLeft: '40px', fontSize: '0.825rem', fontFamily: 'var(--font-mono)' }}
        />
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
          CTRL + K
        </div>
      </div>

      {/* Action Controls & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Real-time Threat Ticker Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
          <Activity size={16} style={{ color: 'var(--accent-red)', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            THREAT: LEVEL-4 HIGH
          </span>
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenAlerts}
          style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
          title="Tactical Threat Stream"
        >
          <Bell size={18} />
          {unreadAlertsCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-red)', color: '#ffffff', borderRadius: '999px', fontSize: '0.65rem', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Badge Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '12px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#050811', fontWeight: 700, fontSize: '0.9rem' }}>
            SK
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Agent K. Sharma
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {userRole || 'SPECIAL CELL / L-5'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          title="Lock Console / Logout"
        >
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
};
