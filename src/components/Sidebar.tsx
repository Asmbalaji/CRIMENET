import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  UserX,
  Network,
  MapPin,
  Bot,
  HardDrive,
  FileText,
  ShieldAlert,
  Settings,
  Shield,
  Activity,
  Link
} from 'lucide-react';

export type ViewId =
  | 'dashboard'
  | 'cases'
  | 'suspects'
  | 'network'
  | 'map'
  | 'ai'
  | 'cross-case'
  | 'evidence'
  | 'reports'
  | 'alerts'
  | 'settings';

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  unreadAlertsCount: number;
}

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  unreadAlertsCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Cases', icon: FolderKanban },
    { id: 'suspects', label: 'Suspects', icon: UserX },
    { id: 'network', label: 'Network Analysis', icon: Network, highlight: true },
    { id: 'map', label: 'Crime Map', icon: MapPin },
    { id: 'cross-case', label: 'Cross-Case Intel', icon: Link, highlight: true },
    { id: 'ai', label: 'AI Investigation', icon: Bot, highlight: true, badge: 'NEXUS' },
    { id: 'evidence', label: 'Evidence', icon: HardDrive },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        borderRadius: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40,
        backgroundColor: '#070b14',
      }}
    >
      {/* Brand Title Banner */}
      <div>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--accent-cyan-glow)',
            }}
          >
            <Shield size={24} style={{ color: '#050811' }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              CRIME<span style={{ color: 'var(--accent-cyan)' }}>NET</span>
            </h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              AI CRIMINAL INTEL v2.4
            </p>
          </div>
        </div>

        {/* Synthetic Warning Tag */}
        <div style={{ padding: '8px 16px', background: 'rgba(0,240,255,0.05)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            <Activity size={12} />
            <span>SYNTHETIC DEMO MODE</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isActive
                    ? '1px solid var(--border-cyan)'
                    : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(0,240,255,0.15) 0%, rgba(15,23,42,0.8) 100%)'
                    : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} style={{ color: isActive ? 'var(--accent-cyan)' : item.highlight ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={
                      item.id === 'alerts' && unreadAlertsCount > 0
                        ? 'badge badge-critical'
                        : 'badge badge-low'
                    }
                    style={{ fontSize: '0.65rem' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(10,15,29,0.8)',
        }}
      >
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <div>SIH PROBLEM STATEMENT:</div>
          <div style={{ color: '#ffffff', fontWeight: 600 }}>SIH26189</div>
          <div style={{ fontSize: '0.65rem', marginTop: '2px', color: 'var(--accent-emerald)' }}>
            ● AGENT CONNECTED
          </div>
        </div>
      </div>
    </aside>
  );
};
