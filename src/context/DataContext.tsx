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
  addLocalEvidence: (e: EvidenceItem) => void;
  addLocalLocation: (l: CrimeLocation) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const baseUrl = 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

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

  const addLocalCase = async (c: InvestigationCase) => {
    try {
      await fetch(`${baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      fetchData(); // Refresh UI
    } catch (err) {
      console.error('Failed to save case', err);
    }
  };

  const addLocalSuspect = async (s: Suspect) => {
    try {
      await fetch(`${baseUrl}/entities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      });
      fetchData();
    } catch (err) {
      console.error('Failed to save entity', err);
    }
  };

  const addLocalEvidence = async (e: EvidenceItem) => {
    try {
      await fetch(`${baseUrl}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e)
      });
      fetchData();
    } catch (err) {
      console.error('Failed to save evidence', err);
    }
  };

  const addLocalLocation = async (l: CrimeLocation) => {
    try {
      await fetch(`${baseUrl}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(l)
      });
      fetchData();
    } catch (err) {
      console.error('Failed to save location', err);
    }
  };

  const filteredSuspects = searchQuery 
    ? suspects.filter(s => 
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.alias || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suspects;

  const filteredCases = searchQuery
    ? cases.filter(c =>
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.caseNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.syndicate || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cases;

  return (
    <DataContext.Provider value={{
      suspects: filteredSuspects,
      cases: filteredCases,
      evidence,
      networkNodes,
      networkEdges,
      locations,
      alerts,
      loading,
      error,
      refreshData: fetchData,
      addLocalCase,
      addLocalSuspect,
      addLocalEvidence,
      addLocalLocation,
      searchQuery,
      setSearchQuery
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
