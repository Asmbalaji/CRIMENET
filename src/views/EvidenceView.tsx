import React, { useState } from 'react';
import { HardDrive, Search, Filter, PhoneCall, DollarSign, Camera, FileCode, CheckCircle, Shield } from 'lucide-react';
import { EvidenceItem } from '../data/mockData';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';

interface EvidenceViewProps {
  initialSelectedEvidence?: EvidenceItem | null;
  onNavigate: (view: ViewId, payload?: any) => void;
}
const evidenceData = [
  {
    id: 'EVD-9001', category: 'CDR_LOG', title: 'CDR Intercept #9402: 18-minute Burner Call', source: 'Cell Tower NCR-902', timestamp: '2026-09-04 03:14 AM', confidence: '94.8%', caseId: 'CAS-2026-091', description: 'Voice call intercepted between Burner SIM (SUS-001) and Unregistered IMEI.', attributes: { 'Caller ID': '+91 98765 43210', 'Receiver ID': '+91 93322 11009', 'Duration': '18 min 42 sec', 'Encryption': 'AES-256 VoIP Tunnel', 'Tower Geo': '28.4595 N, 77.0266 E' }
  },
  {
    id: 'EVD-9002', category: 'FINANCIAL', title: 'Crypto Hawala Ledger File: alpha_vault.dat', source: 'Seized Encrypted USB', timestamp: '2026-09-03 11:05 PM', confidence: '99.2%', caseId: 'CAS-2026-088', description: 'Decrypted ledger showing hawala transactions converted to Monero.', attributes: { 'File Size': '14.2 MB', 'Encryption': 'PGP / RSA-4096', 'Total Ledger Value': '$1.8M Equivalent', 'Primary Wallet': '88xT...9AqP', 'Status': 'Funds Frozen' }
  },
  {
    id: 'EVD-9003', category: 'SURVEILLANCE', title: 'CCTV ANPR Camera Scan - Black SUV', source: 'NH-44 Toll Plaza Camera #4', timestamp: '2026-09-04 02:45 PM', confidence: '91.5%', caseId: 'CAS-2026-091', description: 'Automated Number Plate Recognition flagged a suspected syndicate vehicle.', attributes: { 'Plate Number': 'DL-01-AX-9941', 'Vehicle Make': 'Mahindra Scorpio', 'Speed': '112 km/h', 'Occupants': '2 Visible', 'Direction': 'Northbound' }
  },
  {
    id: 'EVD-9004', category: 'BIOMETRIC', title: 'Facial Biometric Match - Terminal Scan', source: 'Airport Security Kiosk Terminal 3', timestamp: '2026-09-05 06:10 AM', confidence: '98.4%', caseId: 'CAS-2026-077', description: 'High-resolution facial scan at boarding gate matched against known associate database.', attributes: { 'Subject': 'Meera Kulkarni', 'Match Accuracy': '98.4%', 'Algorithm': 'NeuroFace v4.1', 'Lighting': 'Optimal / Indoor', 'Action': 'Silent Alert' }
  },
  {
    id: 'EVD-9005', category: 'FINANCIAL', title: 'Offshore SWIFT Transfer Anomaly: Aegis', source: 'FinCEN Database Sync (Node 44)', timestamp: '2026-09-10 14:22 PM', confidence: '98.1%', caseId: 'CAS-2026-091', description: 'Large, structured wire transfers flagged bypassing standard AML checks.', attributes: { 'Origin Bank': 'Cyprus Hellenic', 'Destination Bank': 'Cayman National', 'Amount': '$4.2M USD', 'Flagged By': 'AI Transaction Monitor', 'Risk Score': 'Critical - Tier 1' }
  },
  {
    id: 'EVD-9006', category: 'CYBER', title: 'Encrypted Signal Chat Backup Extract', source: 'Seized Pixel 8 Pro', timestamp: '2026-09-12 09:15 AM', confidence: '100%', caseId: 'CAS-2026-104', description: 'Decrypted local backup of disappearing messages regarding a docks delivery.', attributes: { 'Device Owner': 'Anya Deshmukh', 'Chat Group': 'Logistics_Alpha', 'Messages Recovered': '412', 'Extraction Tool': 'Cellebrite UFED', 'Key Phrase': 'Package is green' }
  },
  {
    id: 'EVD-9007', category: 'GEO_INT', title: 'Thermal Satellite Imagery - Warehouse', source: 'ISRO Cartosat-3 Feed', timestamp: '2026-09-13 23:45 PM', confidence: '87.3%', caseId: 'CAS-2026-091', description: 'Abnormal heat signatures detected at an abandoned factory.', attributes: { 'Target Zone': 'Sector 4 Industrial', 'Sensor Type': 'Infrared / Thermal', 'Temp Delta': '+14°C above ambient', 'Footprint Size': '12,000 sq ft', 'Status': 'Drone Dispatched' }
  },
  {
    id: 'EVD-9008', category: 'SURVEILLANCE', title: 'GPS Tracker Log - Target Vehicle #4', source: 'Magnetic Tracker', timestamp: '2026-09-14 18:30 PM', confidence: '99.9%', caseId: 'CAS-2026-112', description: 'Vehicle made 3 unscheduled stops in known syndicate territory.', attributes: { 'Vehicle': 'Black SUV (MH-01)', 'Tracker Model': 'Micro-G 400', 'Total Distance': '42.5 km', 'Stops Logged': '3', 'Dead Drop Geo': '19.0449 N, 72.8402 E' }
  },
  {
    id: 'EVD-9009', category: 'DOCUMENT', title: 'Forged Passport Scan - David Kessler', source: 'Airport Immigration Kiosk', timestamp: '2026-09-15 01:20 AM', confidence: '91.2%', caseId: 'CAS-2026-088', description: 'Biometric mismatch flagged during automated boarding scan.', attributes: { 'Alias': 'David Kessler', 'Suspected ID': 'Tariq Al-Mansoor', 'Flight': 'EK-501 to Dubai', 'Forgery Level': 'Grade A', 'Action Taken': 'Target Evaded' }
  },
  {
    id: 'EVD-9010', category: 'CYBER', title: 'Dark Web Forum Database Dump', source: 'Joint Interpol Cyber-Taskforce', timestamp: '2026-09-08 11:11 AM', confidence: '82.5%', caseId: 'CAS-2026-091', description: 'Scraped data from Silk Road 4.0. Found target soliciting anonymized SIM cards.', attributes: { 'Forum Name': 'ShadowNet Market', 'Target Handle': '@Bull_09', 'Commodity': 'Anonymized SIMs', 'Payment Method': 'Monero (XMR)', 'IP Traced': 'Routed via 7 Proxies' }
  },
  {
    id: 'EVD-9011', category: 'AUDIO_LOG', title: 'Room Bug Intercept - Hotel Room 402', source: 'Laser Mic (Across Street)', timestamp: '2026-09-11 20:05 PM', confidence: '78.4%', caseId: 'CAS-2026-104', description: 'Partial audio captured through window glass vibrations.', attributes: { 'Location': 'Taj Lands End', 'Audio Quality': 'Low / City Noise', 'Speakers': '2 (Unidentified)', 'Key Phrase': 'Move it to Thursday', 'Filter': 'Noise-Gate Applied' }
  },
  {
    id: 'EVD-9012', category: 'LOGISTICS', title: 'Seized Cargo Manifest - Container MSCU-892', source: 'Customs Border Patrol API', timestamp: '2026-09-02 08:00 AM', confidence: '100%', caseId: 'CAS-2026-077', description: 'Declared as Agricultural Machinery. X-Ray anomalies indicate hidden compartments.', attributes: { 'Vessel': 'MV Ocean Star', 'Origin': 'Shenzhen', 'Destination': 'Nhava Sheva Port', 'Declared Weight': '14,500 kg', 'X-Ray Flag': 'Density Anomaly Zone 4' }
  },
  {
    id: 'EVD-9013', category: 'SURVEILLANCE', title: 'Drone Optical Feed - Highway Pursuit', source: 'Police UAV Unit 7', timestamp: '2026-09-15 02:33 AM', confidence: '96.5%', caseId: 'CAS-2026-112', description: 'Night-vision optical tracking of suspect fleeing a raided safehouse.', attributes: { 'UAV Model': 'Predator-Lite Optics', 'Tracking Time': '44 mins', 'Max Speed': '145 km/h', 'Target': 'Red Ducati Panigale', 'Visual Lock': 'Lost at 03:17 AM' }
  },
  {
    id: 'EVD-9014', category: 'GEO_INT', title: 'Cell Tower Triangulation - Adyar Sector', source: 'Telecom Provider API', timestamp: '2026-09-14 09:12 PM', confidence: '88.0%', caseId: 'CAS-2026-104', description: 'Three consecutive burner phone pings triangulated to a warehouse district in Chennai.', attributes: { 'City Zone': 'Chennai South (Adyar)', 'Ping Radius': '400 meters', 'Devices Pinging': '3 clustered SIMs', 'Movement': 'Static for 4 hours', 'Network': 'Jio 5G Baseband' }
  },
  {
    id: 'EVD-9015', category: 'DOCUMENT', title: 'Shredded Financial Ledger - Recovered', source: 'Trash Receptacle (Safehouse Raid)', timestamp: '2026-09-09 11:00 AM', confidence: '74.2%', caseId: 'CAS-2026-088', description: 'AI-reconstructed cross-cut shredded documents detailing payouts.', attributes: { 'Reconstruction': 'AI Vision Stitching', 'Language': 'Marathi / English', 'Identified Names': '4 (Redacted)', 'Total Sum Payouts': '₹12,50,000', 'Missing Pages': 'Approx. 15%' }
  },
  {
    id: 'EVD-9016', category: 'CYBER', title: 'Zero-Day Exploit Payload Signature', source: 'State Grid Firewall Logs', timestamp: '2026-09-13 04:45 AM', confidence: '99.9%', caseId: 'CAS-2026-091', description: 'Captured malware payload attempting to bridge the air-gapped server farm.', attributes: { 'Attack Vector': 'Spear-Phishing Payload', 'Target': 'Grid Substation 4', 'Malware Family': 'BlackLotus Variant', 'Threat Level': 'Severe / State Level', 'Mitigation': 'Port Closed Manually' }
  },
  {
    id: 'EVD-9017', category: 'BIOMETRIC', title: 'Latent Fingerprint Analysis - Shell Casing', source: 'Forensic Lab 3 (Ballistics)', timestamp: '2026-09-07 14:20 PM', confidence: '68.5%', caseId: 'CAS-2026-112', description: 'Partial right thumbprint recovered from a 9mm casing found at the warehouse perimeter.', attributes: { 'Item': '9mm Brass Casing', 'Print Quality': 'Poor / Smudged', 'Points Matched': '7 / 12 Required', 'Possible Match': 'Kabir Bull Singh', 'Status': 'Inconclusive in Court' }
  },
  {
    id: 'EVD-9018', category: 'LOGISTICS', title: 'Fake Front Company Registration Documents', source: 'Ministry of Corporate Affairs Portal', timestamp: '2026-08-22 10:15 AM', confidence: '100%', caseId: 'CAS-2026-077', description: 'Registration documents for Apex Global Logistics. Directors listed are aliases.', attributes: { 'Company Name': 'Apex Global Logistics', 'Registration ID': 'CIN-U74999MH2025', 'Registered Address': 'Empty Lot, Dharavi', 'Tax Status': 'Active (Filing Null)', 'Flag': 'Fraudulent Directors' }
  },
  {
    id: 'EVD-9019', category: 'AUDIO_LOG', title: 'Wiretap - Harbor Master Office', source: 'Authorized Line Tap (#W-822)', timestamp: '2026-09-14 23:55 PM', confidence: '92.0%', caseId: 'CAS-2026-104', description: 'Intercepted call from target attempting to bribe a port official.', attributes: { 'Target Line': 'Port Authority Desk 4', 'Caller Audio': 'Voice Masking Used', 'Bribe Amount': '₹50 Lakhs Offered', 'Official Response': 'Hesitant / Delayed', 'Length': '2 Min 14 Sec' }
  },
  {
    id: 'EVD-9020', category: 'FINANCIAL', title: 'Money Mule Network Map', source: 'Financial Crimes Unit', timestamp: '2026-09-15 08:30 AM', confidence: '95.5%', caseId: 'CAS-2026-088', description: 'Synthesized graph of 40+ student bank accounts used to smurf illicit funds.', attributes: { 'Node Count': '43 Accounts', 'Average Deposit': '₹49,000', 'Central Node': 'Tariq Al-Mansoor', 'Velocity': 'High / Daily Routing', 'Pattern Type': 'Star-and-Spoke Smurfing' }
  }
];

export const EvidenceView: React.FC<EvidenceViewProps> = ({ initialSelectedEvidence, onNavigate }) => {
  const { cases } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Try to match initialSelectedEvidence or fall back to the first item
  const initialItem = initialSelectedEvidence 
    ? evidenceData.find(e => e.id === initialSelectedEvidence.id) || evidenceData[0] 
    : evidenceData[0];
    
  const [activeItem, setActiveItem] = useState<any>(initialItem);

  const filteredEvidence = evidenceData.filter(
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
          {filteredEvidence.map((item) => {
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
          })}
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
                {activeItem.description}
              </p>

              {/* Metadata forencsic key-value table */}
              <div style={{ background: 'rgba(10,15,29,0.9)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                  FORENSIC METADATA ATTRIBUTES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(activeItem.attributes).map(([key, val]) => (
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
