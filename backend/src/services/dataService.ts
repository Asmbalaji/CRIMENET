import fs from 'fs';
import path from 'path';
import { 
  SYNTHETIC_CASES, 
  SYNTHETIC_SUSPECTS, 
  SYNTHETIC_EVIDENCE, 
  SYNTHETIC_NETWORK_NODES,
  SYNTHETIC_NETWORK_EDGES,
  SYNTHETIC_CRIME_LOCATIONS,
  SYNTHETIC_ALERTS,
  SYNTHETIC_AI_RESPONSES
} from '../data/mockData';

const dbPath = path.join(__dirname, '../../data/db.json');

let db = {
  cases: SYNTHETIC_CASES,
  suspects: SYNTHETIC_SUSPECTS,
  evidence: SYNTHETIC_EVIDENCE,
  locations: SYNTHETIC_CRIME_LOCATIONS,
  alerts: SYNTHETIC_ALERTS,
  networkEdges: SYNTHETIC_NETWORK_EDGES,
};

const loadDb = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      if (data) {
        db = JSON.parse(data);
      } else {
        saveDb();
      }
    } else {
      saveDb();
    }
  } catch (error) {
    console.error('Failed to load db.json', error);
  }
};

const saveDb = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save db.json', error);
  }
};

loadDb();

export const getCases = () => db.cases;
export const getEntities = () => db.suspects;
export const getEvidence = () => db.evidence;
// For network, just return nodes derived from suspects and stored edges? Or let frontend handle nodes?
// Actually frontend uses the backend's /api/network if we don't change it. 
// For now, let's just return SYNTHETIC_NETWORK_NODES temporarily until we fix frontend, or we map it natively.
// Let's just return what we have, but nodes can be mapped from suspects.
export const getNetwork = () => {
  const nodes = db.suspects.map(s => ({
    id: s.id,
    label: s.name || s.alias || 'Unknown',
    type: s.role.toUpperCase().includes('LEADER') ? 'LEADER' : 'OPERATIVE',
    riskScore: s.riskScore,
    syndicate: s.syndicate
  }));
  return { nodes, edges: db.networkEdges };
};
export const getLocations = () => db.locations;
export const getAlerts = () => db.alerts;
export const getAiResponse = () => SYNTHETIC_AI_RESPONSES['default'];

export const addCase = (newCase: any) => {
  db.cases.push(newCase);
  saveDb();
};

export const addEntity = (newEntity: any) => {
  db.suspects.push(newEntity);
  saveDb();
};

export const addEvidence = (newEvidence: any) => {
  db.evidence.push(newEvidence);
  saveDb();
};

export const addLocation = (newLocation: any) => {
  db.locations.push(newLocation);
  saveDb();
};

export const getDashboardMetrics = () => {
  return {
    activeCases: db.cases.filter(c => c.status === 'ACTIVE').length,
    totalCases: db.cases.length,
    totalEntities: db.suspects.length,
    totalEvidence: db.evidence.length,
    totalLocations: db.locations.length,
    totalRelationships: db.networkEdges.length,
  };
};
