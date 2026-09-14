import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Suspect, 
  InvestigationCase, 
  EvidenceItem, 
  NetworkNode, 
  NetworkEdge, 
  CrimeLocation,
  TacticalAlert
} from '../data/mockData';

interface DataContextType {
  suspects: Suspect[];
  cases: InvestigationCase[];
  evidence: EvidenceItem[];
  networkNodes: NetworkNode[];
  networkEdges: NetworkEdge[];
  locations: CrimeLocation[];
  alerts: TacticalAlert[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addLocalCase: (c: InvestigationCase) => void;
  addLocalSuspect: (s: Suspect) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkEdges, setNetworkEdges] = useState<NetworkEdge[]>([]);
  const [locations, setLocations] = useState<CrimeLocation[]>([]);
  const [alerts, setAlerts] = useState<TacticalAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [localCases, setLocalCases] = useState<InvestigationCase[]>(() => {
    const saved = localStorage.getItem('localCases');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [localSuspects, setLocalSuspects] = useState<Suspect[]>(() => {
    const saved = localStorage.getItem('localSuspects');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = 'http://localhost:5000/api';

      const [
        resCases,
        resEntities,
        resEvidence,
        resNetwork,
        resLocations,
        resAlerts
      ] = await Promise.all([
        fetch(`${baseUrl}/cases`),
        fetch(`${baseUrl}/entities`),
        fetch(`${baseUrl}/evidence`),
        fetch(`${baseUrl}/network`),
        fetch(`${baseUrl}/locations`),
        fetch(`${baseUrl}/alerts`)
      ]);

      if (!resCases.ok || !resEntities.ok || !resEvidence.ok || !resNetwork.ok || !resLocations.ok || !resAlerts.ok) {
        throw new Error('Failed to fetch data from backend APIs.');
      }

      const [dataCases, dataEntities, dataEvidence, dataNetwork, dataLocations, dataAlerts] = await Promise.all([
        resCases.json(),
        resEntities.json(),
        resEvidence.json(),
        resNetwork.json(),
        resLocations.json(),
        resAlerts.json()
      ]);

      setCases(dataCases);
      setSuspects(dataEntities);
      setEvidence(dataEvidence);
      setNetworkNodes(dataNetwork.nodes);
      setNetworkEdges(dataNetwork.edges);
      setLocations(dataLocations);
      setAlerts(dataAlerts);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addLocalCase = (c: InvestigationCase) => {
    const updated = [c, ...localCases];
    setLocalCases(updated);
    localStorage.setItem('localCases', JSON.stringify(updated));
  };

  const addLocalSuspect = (s: Suspect) => {
    const updated = [s, ...localSuspects];
    setLocalSuspects(updated);
    localStorage.setItem('localSuspects', JSON.stringify(updated));
  };

  return (
    <DataContext.Provider value={{
      suspects: [...localSuspects, ...suspects],
      cases: [...localCases, ...cases],
      evidence,
      networkNodes,
      networkEdges,
      locations,
      alerts,
      loading,
      error,
      refreshData: fetchData,
      addLocalCase,
      addLocalSuspect
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
