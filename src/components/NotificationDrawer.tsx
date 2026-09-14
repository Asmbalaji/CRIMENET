import React from 'react';
import { X, ShieldAlert, Check, BellRing, Activity } from 'lucide-react';
import { TacticalAlert } from '../data/mockData';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: TacticalAlert[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(5, 8, 17, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-cyan)',
          background: '#0a0f1d',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BellRing size={20} style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#ffffff' }}>
                Tactical Threat Stream
              </h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                REAL-TIME SIH DEMO ALERTS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Button */}
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Check size={14} /> Mark All as Read
          </button>
        </div>

        {/* Alerts List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: alert.read ? 'rgba(15, 23, 42, 0.6)' : 'rgba(15, 23, 42, 0.95)',
                border: alert.read
                  ? '1px solid var(--border-subtle)'
                  : alert.severity === 'CRITICAL'
                  ? '1px solid rgba(239, 68, 68, 0.5)'
                  : '1px solid var(--border-cyan)',
                borderLeft: alert.severity === 'CRITICAL' ? '4px solid var(--accent-red)' : '4px solid var(--accent-cyan)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span
                  className={
                    alert.severity === 'CRITICAL'
                      ? 'badge badge-critical'
                      : alert.severity === 'HIGH'
                      ? 'badge badge-high'
                      : 'badge badge-medium'
                  }
                >
                  {alert.severity}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {alert.timestamp}
                </span>
              </div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                {alert.title}
              </h4>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
