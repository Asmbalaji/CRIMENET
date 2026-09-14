import { InvestigationCase, Suspect, EvidenceItem, NetworkNode, NetworkEdge } from '../data/mockData';

export interface GraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export function buildNetworkFromCases(
  cases: InvestigationCase[],
  suspects: Suspect[],
  evidence: EvidenceItem[],
  selectedCaseId: string = 'ALL'
): GraphData {
  // 1. Filter cases
  const relevantCases = selectedCaseId === 'ALL' 
    ? cases 
    : cases.filter(c => c.id === selectedCaseId);

  // 2. Collect Suspects (Nodes)
  const nodeMap = new Map<string, NetworkNode>();
  
  relevantCases.forEach(c => {
    c.suspectIds.forEach(suspectId => {
      if (!nodeMap.has(suspectId)) {
        const suspect = suspects.find(s => s.id === suspectId);
        if (suspect) {
          // Map Suspect roles to Node Types
          let type: NetworkNode['type'] = 'OPERATIVE';
          const r = suspect.role.toUpperCase();
          if (r.includes('KINGPIN') || r.includes('LEADER') || r.includes('BOSS')) type = 'LEADER';
          else if (r.includes('FINANC') || r.includes('HAWALA') || r.includes('MONEY')) type = 'FINANCIER';
          else if (r.includes('COURIER') || r.includes('SMUGGLER') || r.includes('TRANSPORT')) type = 'COURIER';
          else if (r.includes('FRONT') || r.includes('COMPANY') || r.includes('SHELL')) type = 'FRONT_COMPANY';
          else if (r.includes('CYBER') || r.includes('HACKER') || r.includes('TECH')) type = 'COMM_NODE';

          let label = suspect.name || suspect.displayName || suspect.fullName || suspect.alias;
          if (!label || label.toLowerCase() === 'redacted' || label === 'Name Redacted') {
            const associatedCase = cases.find(caseItem => caseItem.suspectIds.includes(suspect.id));
            if (associatedCase && associatedCase.isPublicRecord) {
              // Compact label for graph
              label = associatedCase.title.split(' vs ')[0] + ' Case';
            } else {
              label = "Public Case Entity";
            }
          }

          nodeMap.set(suspectId, {
            id: suspect.id,
            label,
            type,
            riskScore: suspect.riskScore,
            syndicate: suspect.syndicate
          });
        }
      }
    });
  });

  const nodes = Array.from(nodeMap.values());

  // 3. Collect Edges
  const edgeMap = new Map<string, any>(); // key: "source-target"

  const addEdge = (sourceId: string, targetId: string, relationType: NetworkEdge['type'], caseId: string, baseWeight: number) => {
    if (sourceId === targetId) return;
    
    // Create stable edge ID ensuring undirected graph logic for merging
    const sortedIds = [sourceId, targetId].sort();
    const edgeKey = `${sortedIds[0]}--${sortedIds[1]}`;

    if (!edgeMap.has(edgeKey)) {
      edgeMap.set(edgeKey, {
        id: `EDGE-${edgeKey}`,
        source: sortedIds[0],
        target: sortedIds[1],
        relation: 'Shared Case Association',
        weight: baseWeight,
        type: relationType,
        caseIds: new Set([caseId])
      });
    } else {
      const existing = edgeMap.get(edgeKey);
      existing.weight += baseWeight; // Increase strength
      existing.caseIds.add(caseId);
    }
  };

  // Co-Suspects in the same case
  relevantCases.forEach(c => {
    for (let i = 0; i < c.suspectIds.length; i++) {
      for (let j = i + 1; j < c.suspectIds.length; j++) {
        if (nodeMap.has(c.suspectIds[i]) && nodeMap.has(c.suspectIds[j])) {
          addEdge(c.suspectIds[i], c.suspectIds[j], 'CO_SUSPECT', c.id, 1);
        }
      }
    }
  });

  // Syndicate Hierarchy (connect kingpin to operatives in same syndicate)
  // Just inferring from the nodes we have
  const syndicateMap = new Map<string, string[]>();
  nodes.forEach(n => {
    if (!syndicateMap.has(n.syndicate)) syndicateMap.set(n.syndicate, []);
    syndicateMap.get(n.syndicate)!.push(n.id);
  });

  syndicateMap.forEach((ids, syndicate) => {
    const leaders = ids.filter(id => nodeMap.get(id)?.type === 'LEADER');
    const others = ids.filter(id => nodeMap.get(id)?.type !== 'LEADER');
    
    leaders.forEach(leaderId => {
      others.forEach(otherId => {
        // Find a shared case to associate this hierarchy link, or use 'SYNDICATE-LINK'
        const sharedCase = relevantCases.find(c => c.suspectIds.includes(leaderId) && c.suspectIds.includes(otherId));
        if (sharedCase) {
          addEdge(leaderId, otherId, 'GANG_HIERARCHY', sharedCase.id, 2);
        }
      });
    });
  });

  const edges = Array.from(edgeMap.values()).map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    relation: `${e.relation} (${e.caseIds.size} Cases)`,
    weight: Math.min(e.weight, 5), // Cap weight at 5 for visual sizing
    type: e.type,
    caseIds: Array.from(e.caseIds)
  })) as (NetworkEdge & { caseIds: string[] })[];

  return { nodes, edges };
}

// Simple Connected Components algorithm for clustering
export function calculateClusters(nodes: NetworkNode[], edges: NetworkEdge[]) {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    const s = typeof e.source === 'object' ? (e.source as any).id : e.source;
    const t = typeof e.target === 'object' ? (e.target as any).id : e.target;
    if (adj.has(s)) adj.get(s)!.push(t);
    if (adj.has(t)) adj.get(t)!.push(s);
  });

  const visited = new Set<string>();
  const clusters: { id: number, nodes: NetworkNode[], avgRisk: number }[] = [];
  let clusterId = 1;

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      const clusterNodes: NetworkNode[] = [];
      const queue = [n.id];
      visited.add(n.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        clusterNodes.push(nodes.find(node => node.id === curr)!);
        adj.get(curr)?.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      const avgRisk = clusterNodes.reduce((acc, curr) => acc + curr.riskScore, 0) / clusterNodes.length;
      
      clusters.push({
        id: clusterId++,
        nodes: clusterNodes,
        avgRisk: Math.round(avgRisk)
      });
    }
  });

  return clusters.sort((a, b) => b.nodes.length - a.nodes.length);
}
