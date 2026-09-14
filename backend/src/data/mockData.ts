export interface Suspect {
  id: string;
  name: string;
  displayName?: string;
  fullName?: string;
  alias: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number; // 0 - 100
  syndicate: string;
  role: string;
  status: 'WANTED' | 'UNDER SURVEILLANCE' | 'IN CUSTODY' | 'PERSON OF INTEREST';
  lastKnownLocation: string;
  phone: string;
  avatarColor: string;
  biometrics: {
    dnaMatched: boolean;
    facialMatchScore: number;
    fingerprintRegistered: boolean;
  };
  associatedCaseIds: string[];
  riskFactors: {
    centrality: number;
    severity: number;
    communication: number;
    financial: number;
    location: number;
  };
}

export interface InvestigationCase {
  id: string;
  caseNumber: string;
  title: string;
  syndicate: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'COLD' | 'UNDER REVIEW' | 'SOLVED' | 'CONVICTED' | 'CONVICTION CONFIRMED' | 'ACQUITTED' | 'APPEAL PENDING' | 'OPEN';
  leadOfficer: string;
  dateOpened: string;
  location: string;
  summary: string;
  suspectIds: string[];
  evidenceCount: number;
  
  // Public Case Record Fields
  isPublicRecord?: boolean;
  sourceType?: string;
  firNumber?: string;
  policeStation?: string;
  district?: string;
  incidentDate?: string;
  firDate?: string;
  offences?: string[];
  investigationTimeline?: { step: string; detail: string }[];
  evidenceCategories?: string[];
  trialOutcome?: string;
  appealOutcome?: string;
  finalStatus?: string;
  sourceReference?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'LEADER' | 'FINANCIER' | 'COURIER' | 'OPERATIVE' | 'FRONT_COMPANY' | 'COMM_NODE';
  riskScore: number;
  syndicate: string;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number; // 1 to 5
  type: 'MONEY_FLOW' | 'CDR_CALL' | 'CO_SUSPECT' | 'GANG_HIERARCHY' | 'SURVEILLANCE_LINK';
}

export interface CrimeLocation {
  id: string;
  title: string;
  city: string;
  lat: number;
  lng: number;
  type: 'NARCOTICS_HUB' | 'CYBER_ATTACK' | 'HAWALA_CENTER' | 'ARMS_CACHE' | 'EXTORTION_SITE';
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  caseId: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'CDR_LOG' | 'FINANCIAL_LEDGER' | 'ENCRYPTED_TEXT' | 'CCTV_SNIPPET' | 'BIOMETRIC_FILE';
  timestamp: string;
  source: string;
  confidenceScore: number;
  caseId: string;
  summary: string;
  metadata: Record<string, string>;
}

export interface TacticalAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  category: 'GEOFENCE' | 'CDR_SPIKE' | 'FINANCIAL_ANOMALY' | 'HVT_MOVEMENT';
  read: boolean;
  relatedEntityId?: string;
  relatedCaseId?: string;
  locationId?: string;
  evidenceId?: string;
}

// ================= SYNTHETIC DEMO DATASET ================= //

export const SYNTHETIC_SUSPECTS: Suspect[] = [
  {
    id: 'SUS-001',
    name: 'Vikramaditya Roy',
    alias: 'Viper / Code-9',
    threatLevel: 'CRITICAL',
    riskScore: 96,
    syndicate: 'Syndicate Alpha (Shadow Grid)',
    role: 'Syndicate Kingpin / Mastermind',
    status: 'WANTED',
    lastKnownLocation: 'Sector 62, Cyber City, NCR',
    phone: '+91 98765 43210 (Encrypted VoIP)',
    avatarColor: '#ef4444',
    biometrics: {
      dnaMatched: true,
      facialMatchScore: 98.4,
      fingerprintRegistered: true,
    },
    associatedCaseIds: ['CAS-2026-091', 'CAS-2026-104'],
    riskFactors: { centrality: 32, severity: 25, communication: 18, financial: 11, location: 10 },
  },
  {
    id: 'SUS-002',
    name: 'Ananya Deshmukh',
    alias: 'Ghost Byte',
    threatLevel: 'HIGH',
    riskScore: 88,
    syndicate: 'Syndicate Alpha (Shadow Grid)',
    role: 'Cyber Financial Architect',
    status: 'UNDER SURVEILLANCE',
    lastKnownLocation: 'Bandra Reclamation, Mumbai',
    phone: '+91 91234 56789',
    avatarColor: '#f97316',
    biometrics: {
      dnaMatched: false,
      facialMatchScore: 91.2,
      fingerprintRegistered: true,
    },
    associatedCaseIds: ['CAS-2026-091', 'CAS-2026-088'],
    riskFactors: { centrality: 28, severity: 20, communication: 10, financial: 22, location: 8 },
  },
  {
    id: 'SUS-003',
    name: 'Kabir "Bull" Singh',
    alias: 'Bull-07',
    threatLevel: 'CRITICAL',
    riskScore: 92,
    syndicate: 'Northern Syndicate Axis',
    role: 'Arms & Logistics Commander',
    status: 'WANTED',
    lastKnownLocation: 'G.T. Road Transit Zone, Punjab',
    phone: '+91 99887 76655',
    avatarColor: '#dc2626',
    biometrics: {
      dnaMatched: true,
      facialMatchScore: 95.8,
      fingerprintRegistered: true,
    },
    associatedCaseIds: ['CAS-2026-104', 'CAS-2026-112'],
    riskFactors: { centrality: 25, severity: 28, communication: 15, financial: 14, location: 10 },
  },
  {
    id: 'SUS-004',
    name: 'Tariq Al-Mansoor',
    alias: 'Banker-X',
    threatLevel: 'HIGH',
    riskScore: 84,
    syndicate: 'Hawala International Network',
    role: 'Offshore Money Laundering Lead',
    status: 'PERSON OF INTEREST',
    lastKnownLocation: 'Commercial Bay, Kochi Port',
    phone: '+91 94455 66778',
    avatarColor: '#eab308',
    biometrics: {
      dnaMatched: false,
      facialMatchScore: 86.5,
      fingerprintRegistered: false,
    },
    associatedCaseIds: ['CAS-2026-088'],
    riskFactors: { centrality: 15, severity: 15, communication: 14, financial: 30, location: 10 },
  },
  {
    id: 'SUS-005',
    name: 'Rajesh "Shadow" Verma',
    alias: 'Phantom Operator',
    threatLevel: 'MEDIUM',
    riskScore: 68,
    syndicate: 'Syndicate Alpha (Shadow Grid)',
    role: 'Ground Telecom & CDR Intermediary',
    status: 'IN CUSTODY',
    lastKnownLocation: 'Special Cell Holding Facility 3',
    phone: '+91 93322 11009',
    avatarColor: '#3b82f6',
    biometrics: {
      dnaMatched: true,
      facialMatchScore: 99.1,
      fingerprintRegistered: true,
    },
    associatedCaseIds: ['CAS-2026-091'],
    riskFactors: { centrality: 20, severity: 12, communication: 24, financial: 5, location: 7 },
  },
  {
    id: 'SUS-006',
    name: 'Meera Kulkarni',
    alias: 'Siren',
    threatLevel: 'HIGH',
    riskScore: 79,
    syndicate: 'Apex Counterfeit Cell',
    role: 'Fake Currency Distribution Manager',
    status: 'UNDER SURVEILLANCE',
    lastKnownLocation: 'Park Street Extension, Kolkata',
    phone: '+91 98112 23344',
    avatarColor: '#a855f7',
    biometrics: {
      dnaMatched: true,
      facialMatchScore: 89.7,
      fingerprintRegistered: true,
    },
    associatedCaseIds: ['CAS-2026-112'],
    riskFactors: { centrality: 18, severity: 18, communication: 18, financial: 15, location: 10 },
  },
  {
    id: 'ENTITY-PUB-001',
    name: 'Name Redacted',
    alias: 'Accused (Crl.A(MD)No.1126/23)',
    threatLevel: 'HIGH',
    riskScore: 80,
    syndicate: 'Public Record',
    role: 'Accused',
    status: 'IN CUSTODY',
    lastKnownLocation: 'Tamil Nadu',
    phone: 'Redacted',
    avatarColor: '#64748b',
    biometrics: { dnaMatched: false, facialMatchScore: 0, fingerprintRegistered: true },
    associatedCaseIds: ['CASE-PUB-001'],
    riskFactors: { centrality: 0, severity: 20, communication: 0, financial: 0, location: 0 }
  },
  {
    id: 'ENTITY-PUB-002',
    name: 'Name Redacted',
    alias: 'Accused (Crl.A(MD)No.1368/25)',
    threatLevel: 'HIGH',
    riskScore: 75,
    syndicate: 'Public Record',
    role: 'Accused',
    status: 'IN CUSTODY',
    lastKnownLocation: 'Thanjavur',
    phone: 'Redacted',
    avatarColor: '#64748b',
    biometrics: { dnaMatched: false, facialMatchScore: 0, fingerprintRegistered: true },
    associatedCaseIds: ['CASE-PUB-002'],
    riskFactors: { centrality: 0, severity: 20, communication: 0, financial: 0, location: 0 }
  },
  {
    id: 'ENTITY-PUB-003',
    name: 'Name Redacted',
    alias: 'Accused (Crl.A(MD)No.58/24)',
    threatLevel: 'HIGH',
    riskScore: 85,
    syndicate: 'Public Record',
    role: 'Accused',
    status: 'IN CUSTODY',
    lastKnownLocation: 'Tamil Nadu',
    phone: 'Redacted',
    avatarColor: '#64748b',
    biometrics: { dnaMatched: false, facialMatchScore: 0, fingerprintRegistered: true },
    associatedCaseIds: ['CASE-PUB-003'],
    riskFactors: { centrality: 0, severity: 20, communication: 0, financial: 0, location: 0 }
  }
];

export const SYNTHETIC_CASES: InvestigationCase[] = [
  {
    id: 'CASE-PUB-001',
    caseNumber: 'TN-CASE-001',
    title: 'R.Kannan vs The Inspector Of Police',
    syndicate: 'Public Record (Names Redacted)',
    severity: 'HIGH',
    status: 'CONVICTED',
    leadOfficer: 'Inspector of Police',
    dateOpened: 'Unknown',
    location: 'Tamil Nadu',
    summary: 'Public judicial record of a documented criminal case involving forensic evidence, CDR, and trial conviction.',
    suspectIds: ['ENTITY-PUB-001'],
    evidenceCount: 7,
    
    // Public Case Record Fields
    isPublicRecord: true,
    sourceType: 'Madras High Court',
    firNumber: 'Available in CRL.A.(MD).Nos.1126/2023',
    policeStation: 'Not publicly available',
    district: 'Tamil Nadu',
    incidentDate: 'Not publicly available',
    firDate: 'Not publicly available',
    offences: ['IPC Sections as per judgment'],
    investigationTimeline: [
      { step: 'FIR Registered', detail: 'Initial complaint filed' },
      { step: 'Scene Investigation', detail: 'Examination of crime scene' },
      { step: 'Post-Mortem', detail: 'Medical examination conducted' },
      { step: 'Arrest & Recovery', detail: 'Accused arrested, material objects recovered' },
      { step: 'Forensic Examination', detail: 'Scientific evidence analyzed' },
      { step: 'Call Detail Records', detail: 'Telecom evidence collected' },
      { step: 'Final Report', detail: 'Charge sheet filed' },
      { step: 'Trial', detail: 'Conviction by Trial Court' }
    ],
    evidenceCategories: [
      'Medical Evidence',
      'Forensic Evidence',
      'Call Detail Records',
      'Recovered Material Objects'
    ],
    trialOutcome: 'Convicted',
    appealOutcome: 'Judgment in CRL.A.(MD).Nos.1126 of 2023 and 2 of 2024',
    finalStatus: 'CONVICTED',
    sourceReference: 'Madras High Court - CRL.A.(MD).Nos.1126 of 2023 and 2 of 2024'
  },
  {
    id: 'CASE-PUB-002',
    caseNumber: 'TN-CASE-002',
    title: 'K.Sasikumar vs The State of Tamil Nadu',
    syndicate: 'Public Record (Names Redacted)',
    severity: 'HIGH',
    status: 'CONVICTION CONFIRMED',
    leadOfficer: 'Inspector of Police',
    dateOpened: '2018',
    location: 'Thanjavur, Tamil Nadu',
    summary: 'Criminal appeal detailing trial conviction and sentencing for an incident registered at Thanjavur Medical College Hospital Police Station.',
    suspectIds: ['ENTITY-PUB-002'],
    evidenceCount: 3,
    
    // Public Case Record Fields
    isPublicRecord: true,
    sourceType: 'Madras High Court',
    firNumber: 'Crime No.384 of 2018',
    policeStation: 'Thanjavur Medical College Hospital Police Station',
    district: 'Thanjavur',
    incidentDate: '2018',
    firDate: '2018',
    offences: ['IPC Sections as per Crime No.384 of 2018'],
    investigationTimeline: [
      { step: 'FIR Registered', detail: 'Crime No.384 of 2018 registered' },
      { step: 'Investigation', detail: 'Police investigation conducted' },
      { step: 'Final Report', detail: 'Charge sheet filed' },
      { step: 'Trial', detail: 'Conviction and sentence by Trial Court' }
    ],
    evidenceCategories: [
      'Documentary Evidence',
      'Witness Evidence'
    ],
    trialOutcome: 'Convicted and Sentenced',
    appealOutcome: 'Judgment in Crl.A(MD)No.1368 of 2025 (or relative year)',
    finalStatus: 'CONVICTION CONFIRMED',
    sourceReference: 'Madras High Court - Crl.A(MD)No.1368 of 2025'
  },
  {
    id: 'CASE-PUB-003',
    caseNumber: 'TN-CASE-003',
    title: 'Ganesan vs The Inspector Of Police',
    syndicate: 'Public Record (Names Redacted)',
    severity: 'HIGH',
    status: 'CONVICTED',
    leadOfficer: 'Inspector of Police',
    dateOpened: 'Unknown',
    location: 'Tamil Nadu',
    summary: 'Public judicial record detailing forensic evidence, recovery of blood-stained clothing and weapons, leading to trial conviction.',
    suspectIds: ['ENTITY-PUB-003'],
    evidenceCount: 5,
    
    // Public Case Record Fields
    isPublicRecord: true,
    sourceType: 'Madras High Court',
    firNumber: 'Not publicly available in prompt',
    policeStation: 'Not publicly available',
    district: 'Tamil Nadu',
    incidentDate: 'Not publicly available',
    firDate: 'Not publicly available',
    offences: ['IPC Sections as per judgment'],
    investigationTimeline: [
      { step: 'FIR & Investigation', detail: 'Initial registration and evidence gathering' },
      { step: 'Recovery', detail: 'Blood-stained clothing and weapons recovered' },
      { step: 'Forensic Examination', detail: 'Scientific analysis of recovered items' },
      { step: 'Trial', detail: 'Trial court conviction' },
      { step: 'Appeal', detail: 'Crl.A.(MD)No.58 of 2024 filed' }
    ],
    evidenceCategories: [
      'Forensic Evidence',
      'Recovered Material Objects',
      'Medical Evidence'
    ],
    trialOutcome: 'Convicted',
    appealOutcome: 'Judgment in Crl.A.(MD)No.58 of 2024',
    finalStatus: 'CONVICTED',
    sourceReference: 'Madras High Court - Crl.A.(MD)No.58 of 2024'
  },
  {
    id: 'CAS-2026-091',
    caseNumber: 'SIH-CRIM-2026-091',
    title: 'Operation Shadow Grid: Cyber Extortion',
    syndicate: 'Syndicate Alpha (Shadow Grid)',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    leadOfficer: 'SSP R. Vardhan',
    dateOpened: '2026-07-14',
    location: 'Delhi-NCR',
    summary: 'Synthetic demonstration case for network analysis.',
    suspectIds: ['SUS-001', 'SUS-002', 'SUS-005'],
    evidenceCount: 42,
    isPublicRecord: false
  },
  {
    id: 'CAS-2026-104',
    caseNumber: 'SIH-CRIM-2026-104',
    title: 'Project Iron Sight: Arms Logistics',
    syndicate: 'Northern Syndicate Axis',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    leadOfficer: 'Dig Vikramaditya',
    dateOpened: '2026-08-02',
    location: 'Transit Highway 44',
    summary: 'Synthetic demonstration case for spatial cluster analysis.',
    suspectIds: ['SUS-001', 'SUS-003'],
    evidenceCount: 28,
    isPublicRecord: false
  },
  {
    id: 'CAS-2026-088',
    caseNumber: 'SIH-CRIM-2026-088',
    title: 'Operation Quantum Clean: Hawala Laundering',
    syndicate: 'Hawala International Network',
    severity: 'HIGH',
    status: 'UNDER REVIEW',
    leadOfficer: 'Inspector P. Menon',
    dateOpened: '2026-06-21',
    location: 'Kochi Port',
    summary: 'Synthetic demonstration case for financial node graph anomaly detection.',
    suspectIds: ['SUS-002', 'SUS-004'],
    evidenceCount: 65,
    isPublicRecord: false
  },
  {
    id: 'CAS-2026-112',
    caseNumber: 'SIH-CRIM-2026-112',
    title: 'Operation Silver Shield: Counterfeit Distribution',
    syndicate: 'Apex Counterfeit Cell',
    severity: 'MEDIUM',
    status: 'COLD',
    leadOfficer: 'ACP Sunita Rao',
    dateOpened: '2026-05-10',
    location: 'Kolkata Metro',
    summary: 'Synthetic demonstration case for supply chain tracking.',
    suspectIds: ['SUS-003', 'SUS-006'],
    evidenceCount: 19,
    isPublicRecord: false
  }
];

export const SYNTHETIC_NETWORK_NODES: NetworkNode[] = [
  { id: 'SUS-001', label: 'Vikramaditya Roy (Viper)', type: 'LEADER', riskScore: 96, syndicate: 'Syndicate Alpha' },
  { id: 'SUS-002', label: 'Ananya Deshmukh (Ghost)', type: 'FINANCIER', riskScore: 88, syndicate: 'Syndicate Alpha' },
  { id: 'SUS-003', label: 'Kabir Singh (Bull)', type: 'OPERATIVE', riskScore: 92, syndicate: 'Northern Axis' },
  { id: 'SUS-004', label: 'Tariq Al-Mansoor', type: 'FINANCIER', riskScore: 84, syndicate: 'Hawala Int' },
  { id: 'SUS-005', label: 'Rajesh Verma (Shadow)', type: 'COURIER', riskScore: 68, syndicate: 'Syndicate Alpha' },
  { id: 'SUS-006', label: 'Meera Kulkarni (Siren)', type: 'OPERATIVE', riskScore: 79, syndicate: 'Apex Cell' },
  { id: 'NODE-SHELL-1', label: 'Veritas Apex Pvt Ltd (Shell)', type: 'FRONT_COMPANY', riskScore: 75, syndicate: 'Hawala Int' },
  { id: 'NODE-CDR-TOWER', label: 'Cell Tower Cluster 09 (Cyber City)', type: 'COMM_NODE', riskScore: 60, syndicate: 'Syndicate Alpha' },
  { id: 'NODE-FIN-SWIFT', label: 'Offshore Account #8942-KYC', type: 'FRONT_COMPANY', riskScore: 82, syndicate: 'Hawala Int' },
];

export const SYNTHETIC_NETWORK_EDGES: NetworkEdge[] = [
  { id: 'E1', source: 'SUS-001', target: 'SUS-002', relation: 'Encrypted Command Signal', weight: 5, type: 'GANG_HIERARCHY' },
  { id: 'E2', source: 'SUS-001', target: 'SUS-003', relation: 'Weapons Transit Order', weight: 4, type: 'SURVEILLANCE_LINK' },
  { id: 'E3', source: 'SUS-002', target: 'SUS-004', relation: 'Hawala Wire (₹45M INR)', weight: 5, type: 'MONEY_FLOW' },
  { id: 'E4', source: 'SUS-002', target: 'NODE-SHELL-1', relation: 'Corporate Directorship', weight: 3, type: 'MONEY_FLOW' },
  { id: 'E5', source: 'SUS-004', target: 'NODE-FIN-SWIFT', relation: 'SWIFT Transfer Route', weight: 4, type: 'MONEY_FLOW' },
  { id: 'E6', source: 'SUS-001', target: 'SUS-005', relation: 'Burner SIM Handoff', weight: 3, type: 'CDR_CALL' },
  { id: 'E7', source: 'SUS-005', target: 'NODE-CDR-TOWER', relation: '142 Call Spikes (03:00 AM)', weight: 5, type: 'CDR_CALL' },
  { id: 'E8', source: 'SUS-003', target: 'SUS-006', relation: 'Safehouse Sharing', weight: 2, type: 'CO_SUSPECT' },
];

export const SYNTHETIC_CRIME_LOCATIONS: CrimeLocation[] = [
  {
    id: 'LOC-101',
    title: 'Cyber Extortion Server Farm Node',
    city: 'Gurugram, HR (NCR Zone)',
    lat: 28.4595,
    lng: 77.0266,
    type: 'CYBER_ATTACK',
    threatLevel: 'CRITICAL',
    timestamp: '2026-09-04 22:15',
    caseId: 'CAS-2026-091',
  },
  {
    id: 'LOC-102',
    title: 'Hawala Cash Exchange Depot',
    city: 'Bandra West, Mumbai, MH',
    lat: 19.0596,
    lng: 72.8295,
    type: 'HAWALA_CENTER',
    threatLevel: 'HIGH',
    timestamp: '2026-09-05 08:30',
    caseId: 'CAS-2026-088',
  },
  {
    id: 'LOC-103',
    title: 'Illegal Arms Transit Interception',
    city: 'Ambala Highway Junction, PB',
    lat: 30.3782,
    lng: 76.7767,
    type: 'ARMS_CACHE',
    threatLevel: 'CRITICAL',
    timestamp: '2026-09-03 14:00',
    caseId: 'CAS-2026-104',
  },
  {
    id: 'LOC-104',
    title: 'Counterfeit Currency Stash House',
    city: 'Sealdah Metro Ring, Kolkata, WB',
    lat: 22.5645,
    lng: 88.3697,
    type: 'NARCOTICS_HUB',
    threatLevel: 'MEDIUM',
    timestamp: '2026-08-29 11:45',
    caseId: 'CAS-2026-112',
  },
  {
    id: 'LOC-105',
    title: 'Offshore Logistics Container Yard',
    city: 'Kochi Port Trust, KL',
    lat: 9.9658,
    lng: 76.2627,
    type: 'EXTORTION_SITE',
    threatLevel: 'HIGH',
    timestamp: '2026-09-01 19:20',
    caseId: 'CAS-2026-088',
  },
];

export const SYNTHETIC_EVIDENCE: EvidenceItem[] = [
  {
    id: 'EVD-9001',
    title: 'CDR Intercept #9402: 18-minute Burner Call',
    category: 'CDR_LOG',
    timestamp: '2026-09-04 03:14 AM',
    source: 'Cell Tower NCR-902 (Cyber City)',
    confidenceScore: 94.8,
    caseId: 'CAS-2026-091',
    summary: 'Voice call intercepted between Burner SIM #98765-43210 (SUS-001) and Unregistered IMEI 864920194.',
    metadata: {
      'Caller ID': '+91 98765 43210',
      'Receiver ID': '+91 93322 11009',
      'Duration': '18 min 42 sec',
      'Encryption': 'AES-256 VoIP Tunnel',
      'Tower Geo': '28.4595 N, 77.0266 E',
    },
  },
  {
    id: 'EVD-9002',
    title: 'Crypto Hawala Ledger File: "alpha_vault.dat"',
    category: 'FINANCIAL_LEDGER',
    timestamp: '2026-09-03 11:05 PM',
    source: 'Seized Encrypted USB (Case 088)',
    confidenceScore: 99.2,
    caseId: 'CAS-2026-088',
    summary: 'Decrypted spreadsheet detailing 34 transactions totaling ₹140M INR routed through shell companies in GIFT City.',
    metadata: {
      'Total Amount': '₹140,500,000 INR',
      'Primary Shell': 'Veritas Apex Pvt Ltd',
      'Destination Vault': 'USDT ERC20 Wallet #0x9f4a...89c',
      'Ledger Integrity': 'VERIFIED SYNTHETIC HASH',
    },
  },
  {
    id: 'EVD-9003',
    title: 'CCTV ANPR Camera Scan - Black SUV DL-01-AX-9941',
    category: 'CCTV_SNIPPET',
    timestamp: '2026-09-04 02:45 PM',
    source: 'NH-44 Toll Plaza Camera #4',
    confidenceScore: 91.5,
    caseId: 'CAS-2026-104',
    summary: 'Automatic License Plate Recognition system captured vehicle linked to HVT Kabir "Bull" Singh moving Northbound.',
    metadata: {
      'Plate Match': 'DL-01-AX-9941 (ALERT MATCH)',
      'Vehicle Model': 'Fortuner Dark Metallic',
      'Occupants Count': '3 Persons Recognized',
      'Speed': '114 km/h',
    },
  },
  {
    id: 'EVD-9004',
    title: 'Facial Biometric Match - High-Resolution Terminal Scan',
    category: 'BIOMETRIC_FILE',
    timestamp: '2026-09-05 06:10 AM',
    source: 'Airport Security Kiosk Terminal 3',
    confidenceScore: 98.4,
    caseId: 'CAS-2026-091',
    summary: 'Neural network facial recognition system matched synthetic facial geometry to HVT Vikramaditya Roy with 98.4% certainty.',
    metadata: {
      'Match Score': '98.4% Confidence',
      'Database Reference': 'HVT-WANTED-001',
      'Biometric Vector': '128-d Embedding Distance 0.12',
    },
  },
];

export const SYNTHETIC_ALERTS: TacticalAlert[] = [
  {
    id: 'ALT-501',
    timestamp: 'Just now (13:45 IST)',
    title: 'CRITICAL: HVT Proximity Alert - Sector 62 Cyber City',
    message: 'Burner SIM associated with HVT-001 (Vikramaditya Roy) pinged Cell Tower NCR-902.',
    severity: 'CRITICAL',
    category: 'HVT_MOVEMENT',
    read: false,
    relatedEntityId: 'SUS-001',
    relatedCaseId: 'CAS-2026-091',
    locationId: 'LOC-101',
    evidenceId: 'EVD-9001',
  },
  {
    id: 'ALT-502',
    timestamp: '14 minutes ago',
    title: 'FINANCIAL ANOMALY: ₹45,000,000 INR Rapid Wire',
    message: 'Automated ML flags bulk money transfer from Veritas Apex Pvt Ltd to offshore destination wallet.',
    severity: 'HIGH',
    category: 'FINANCIAL_ANOMALY',
    read: false,
    relatedEntityId: 'SUS-002',
    relatedCaseId: 'CAS-2026-088',
    locationId: 'LOC-102',
    evidenceId: 'EVD-9002',
  },
  {
    id: 'ALT-503',
    timestamp: '1 hour ago',
    title: 'CDR BURST DETECTED: 142 Call Spikes',
    message: 'Unusual call frequency spike between Suspect 005 (Rajesh Verma) and 12 unidentified numbers within 30 minutes.',
    severity: 'WARNING',
    category: 'CDR_SPIKE',
    read: true,
    relatedEntityId: 'SUS-005',
    relatedCaseId: 'CAS-2026-091',
  },
  {
    id: 'ALT-504',
    timestamp: '3 hours ago',
    title: 'GEOFENCE BREACH: Vehicle DL-01-AX-9941',
    message: 'ANPR camera flagged vehicle crossing Highway Toll Plaza 4, entering restricted security zone.',
    severity: 'HIGH',
    category: 'GEOFENCE',
    read: true,
    relatedEntityId: 'SUS-003',
    relatedCaseId: 'CAS-2026-104',
    locationId: 'LOC-103',
    evidenceId: 'EVD-9003',
  },
];

export const AI_PROMPT_SUGGESTIONS = [
  'Analyze connections between Vikramaditya Roy and Hawala shell accounts.',
  'Identify top 3 central nodes in Syndicate Alpha network.',
  'Predict potential location of next weapons shipment based on ANPR trends.',
  'Summarize evidence timeline for Case SIH-CRIM-2026-091.',
];

export const SYNTHETIC_AI_RESPONSES: Record<string, any> = {
  'default': {
    answer: "Based on the synthetic dataset, I have analyzed the network graph for Syndicate Alpha. The command structure indicates a highly centralized flow of encrypted communications through a primary hub.",
    keyEntities: [{ id: 'SUS-001', label: 'Vikramaditya Roy' }, { id: 'NODE-CDR-TOWER', label: 'Cell Tower Cluster 09' }],
    detectedPattern: "High-frequency burst transmissions (142 calls) observed between 02:00 and 04:00 AM IST.",
    supportingEvidence: [{ id: 'EVD-9001', label: 'CDR Intercept #9402' }],
    confidence: 94.2,
    nextStep: "Initiate deep-packet inspection on Node 09 and dispatch field surveillance to Sector 62."
  }
};

