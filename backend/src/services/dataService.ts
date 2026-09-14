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

export const getCases = () => SYNTHETIC_CASES;
export const getEntities = () => SYNTHETIC_SUSPECTS;
export const getEvidence = () => SYNTHETIC_EVIDENCE;
export const getNetwork = () => ({ nodes: SYNTHETIC_NETWORK_NODES, edges: SYNTHETIC_NETWORK_EDGES });
export const getLocations = () => SYNTHETIC_CRIME_LOCATIONS;
export const getAlerts = () => SYNTHETIC_ALERTS;
export const getAiResponse = () => SYNTHETIC_AI_RESPONSES['default'];
