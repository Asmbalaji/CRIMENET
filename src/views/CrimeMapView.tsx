import React, { useState } from 'react';
import { MapPin, Filter, Layers, Navigation, AlertTriangle, Shield, Flame, Activity } from 'lucide-react';
import { CrimeLocation } from '../data/mockData';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CrimeMapViewProps {
  initialSelectedLocation?: CrimeLocation | null;
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const CrimeMapView: React.FC<CrimeMapViewProps> = ({ initialSelectedLocation, onNavigate }) => {
  const { locations, cases, suspects } = useData();
  const [selectedLocation, setSelectedLocation] = useState<CrimeLocation | null>(initialSelectedLocation !== undefined ? initialSelectedLocation : null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showHeatmap, setShowHeatmap] = useState(true);

  const filteredLocations = locations.filter(
    (loc) => typeFilter === 'ALL' || loc.caseId === typeFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Controls Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            Geospatial Crime Intelligence & Threat Hotspots
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            DYNAMIC INVESTIGATION HOTSPOTS • SPATIAL EVENT MAPPING
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={showHeatmap ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Flame size={16} /> {showHeatmap ? 'Heatmap: ON' : 'Heatmap: OFF'}
          </button>

          <select
            className="input-field"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '200px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
          >
            <option value="ALL">All Cases</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>{c.title || c.caseNumber}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map Container & Location Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Map Canvas Visualizer */}
        <div
          className="glass-panel-glow"
          style={{
            position: 'relative',
            background: '#040711',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <MapContainer 
            center={[22.5937, 78.9629]} 
            zoom={5} 
            style={{ height: '100%', width: '100%', zIndex: 1, background: '#040711' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles-dark"
            />
            {filteredLocations.map((loc) => {
              if (loc.lat === null || loc.lng === null) return null;

              const isSelected = selectedLocation?.id === loc.id;
              const isCritical = loc.threatLevel === 'CRITICAL';
              const color = isCritical ? '#ef4444' : '#f59e0b';
              const pulseHtml = isCritical ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.3); border: 1px solid #ef4444; animation: pulse 1.5s infinite; top: -11px; left: -11px;"></div>` : '';
              const iconHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                  ${pulseHtml}
                  <div style="padding: 8px; border-radius: 50%; background: ${color}; color: #050811; box-shadow: 0 0 15px ${color}; border: ${isSelected ? '2px solid #ffffff' : 'none'}; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div style="margin-top: 6px; background: rgba(10,15,29,0.92); padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; font-weight: 700; color: #ffffff; font-family: monospace; white-space: nowrap;">
                    ${loc.city.split(',')[0]}
                  </div>
                </div>
              `;
              
              const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-map-marker',
                iconSize: [40, 60],
                iconAnchor: [20, 20],
              });

              return (
                <Marker 
                  key={loc.id} 
                  position={[loc.lat, loc.lng]} 
                  icon={customIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(loc)
                  }}
                  zIndexOffset={isSelected ? 1000 : 0}
                />
              );
            })}
          </MapContainer>

          {/* Map Compass */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'rgba(10,15,29,0.85)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--accent-cyan)' }}>
            <Navigation size={20} />
          </div>
        </div>

        {/* Location Inspector Panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div className="card-title" style={{ fontSize: '1rem', color: 'var(--accent-amber)' }}>
              <MapPin size={18} /> Location Details
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '8px', lineHeight: 1.4 }}>
              Map indicators represent activity in verified investigation records and are not determinations of guilt or inherent danger.
            </p>
          </div>

          {filteredLocations.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
               <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>NO VERIFIED LOCATIONS</div>
               <div style={{ fontSize: '0.75rem' }}>Upload and verify a case document containing location information to populate the map.</div>
             </div>
          ) : selectedLocation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className={selectedLocation.threatLevel === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'} style={{ marginBottom: '8px' }}>
                  ANALYTICAL CASE PRIORITY: {selectedLocation.threatLevel}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  {selectedLocation.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {selectedLocation.city}{selectedLocation.district ? `, ${selectedLocation.district}` : ''}{selectedLocation.state ? `, ${selectedLocation.state}` : ''}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(10,15,29,0.8)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>LINKED CASES</div>
                <div style={{ color: 'var(--accent-cyan)' }}>{selectedLocation.caseId || 'UNKNOWN'}</div>
                
                <div style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '4px' }}>EVIDENCE REFERENCES</div>
                <div style={{ color: 'var(--accent-amber)' }}>{selectedLocation.sourceEvidenceId || 'None explicitly linked'}</div>

                <div style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '4px' }}>SOURCE DOCUMENTS</div>
                <div style={{ color: '#ffffff' }}>{selectedLocation.sourcePages && selectedLocation.sourcePages.length > 0 ? `FIR Document — Page ${selectedLocation.sourcePages.join(', ')}` : 'Verified Investigation Record'}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexDirection: 'column' }}>
                <button 
                  onClick={() => onNavigate('cases', { case: cases.find(c => c.id === selectedLocation.caseId) })}
                  className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}>
                  Open Case File
                </button>
                <button 
                  onClick={() => onNavigate('evidence')}
                  className="btn btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}>
                  View Evidence Vault
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Select a marker to inspect verified location data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
