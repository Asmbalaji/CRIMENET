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

export const AI_PROMPT_SUGGESTIONS = [
  'Analyze connections between Vikramaditya Roy and Hawala shell accounts.',
  'Identify top 3 central nodes in Syndicate Alpha network.',
  'Predict potential location of next weapons shipment based on ANPR trends.',
  'Summarize evidence timeline for Case SIH-CRIM-2026-091.',
];
