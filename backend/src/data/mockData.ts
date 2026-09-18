export interface Suspect {
  id: string;
  name: string;
  nameOriginal?: string;
  originalLanguage?: string;
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
  titleOriginal?: string;
  originalLanguage?: string;
  city: string;
  district?: string;
  state?: string;
  lat: number | null;
  lng: number | null;
  type: 'NARCOTICS_HUB' | 'CYBER_ATTACK' | 'HAWALA_CENTER' | 'ARMS_CACHE' | 'EXTORTION_SITE' | 'GENERAL_LOCATION';
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
  caseId: string;
  sourceEvidenceId?: string;
  sourcePages?: number[];
  verified?: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  titleOriginal?: string;
  originalLanguage?: string;
  category: 'CDR_LOG' | 'FINANCIAL_LEDGER' | 'ENCRYPTED_TEXT' | 'CCTV_SNIPPET' | 'BIOMETRIC_FILE' | 'DOCUMENT';
  timestamp: string;
  source: string;
  sourcePages?: number[];
  sourceEvidenceId?: string;
  verified?: boolean;
  confidenceScore: number;
  caseId: string;
  summary: string;
  metadata?: Record<string, string>;
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

export interface CrossCaseLink {
  id: string;
  sourceCaseId: string;
  targetCaseId: string;
  reason: string;
  supportingEntityId?: string;
  supportingEvidenceId?: string;
  sourceDocument?: string;
  sourcePages?: number[];
  confidence: number;
  relationshipType: 'SHARED_SUSPECT' | 'SHARED_LOCATION' | 'SHARED_MODUS_OPERANDI' | 'FINANCIAL_LINK' | 'COMMUNICATION_LINK';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

// ================= SYNTHETIC DEMO DATASET ================= //

export const SYNTHETIC_SUSPECTS: Suspect[] = [];

export const SYNTHETIC_CASES: InvestigationCase[] = [];

export const SYNTHETIC_NETWORK_NODES: NetworkNode[] = [];

export const SYNTHETIC_NETWORK_EDGES: NetworkEdge[] = [];

export const SYNTHETIC_CRIME_LOCATIONS: CrimeLocation[] = [];

export const SYNTHETIC_EVIDENCE: EvidenceItem[] = [];

export const SYNTHETIC_ALERTS: TacticalAlert[] = [];

export const AI_PROMPT_SUGGESTIONS = [
  'Analyze connections between recently added suspects.',
  'Identify top 3 central nodes in the active network.',
  'Summarize evidence timeline for current active case.',
];

export const SYNTHETIC_AI_RESPONSES: Record<string, any> = {
  'default': {
    answer: "No verified investigation data is currently available for analysis.",
    keyEntities: [],
    detectedPattern: "Insufficient data.",
    supportingEvidence: [],
    confidence: 0,
    nextStep: "Upload and verify a case document to begin analysis."
  }
};

