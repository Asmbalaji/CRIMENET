import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Network, Search, Maximize2, Crosshair, ZoomIn, ZoomOut, Bot, Loader2, X, ChevronRight, BarChart2, ArrowRight
} from 'lucide-react';
import { ViewId } from '../components/Sidebar';
import { useData } from '../context/DataContext';
import { NetworkNode } from '../data/mockData';
import ForceGraph2D from 'react-force-graph-2d';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { buildNetworkFromCases, calculateClusters } from '../utils/networkBuilder';

interface NetworkAnalysisViewProps {
  initialSelectedNodeId?: string | null;
  initialEvidenceId?: string | null;
  onNavigate: (view: ViewId, payload?: any) => void;
}

const TIMELINE_DATA = [
  { date: 'Aug 01', highRisk: 10, medium: 20, low: 5 },
  { date: 'Aug 05', highRisk: 12, medium: 18, low: 8 },
  { date: 'Aug 10', highRisk: 15, medium: 25, low: 10 },
  { date: 'Aug 15', highRisk: 25, medium: 30, low: 12 },
  { date: 'Aug 20', highRisk: 18, medium: 28, low: 15 },
  { date: 'Aug 25', highRisk: 30, medium: 35, low: 20 },
  { date: 'Aug 30', highRisk: 22, medium: 32, low: 18 }
];

const NODE_COLORS: Record<string, string> = {
  'LEADER': '#ef4444', // Red (Kingpin)
  'OPERATIVE': '#f97316', // Orange
  'FINANCIER': '#22c55e', // Green
  'FRONT_COMPANY': '#a855f7', // Purple
  'COMM_NODE': '#06b6d4', // Cyan
  'DEFAULT': '#3b82f6' // Blue
};

export const NetworkAnalysisView: React.FC<NetworkAnalysisViewProps> = ({ initialSelectedNodeId, initialEvidenceId, onNavigate }) => {
  const { cases, suspects, evidence } = useData();
  const fgRef = useRef<any>();
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoverNode, setHoverNode] = useState<NetworkNode | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-resize graph
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Build the network dynamically from actual cases/suspects data
  const { nodes, edges, clusters, topConnections } = useMemo(() => {
    const data = buildNetworkFromCases(cases, suspects, evidence, selectedCaseId);
    const cl = calculateClusters(data.nodes, data.edges);
    const tc = [...data.edges].sort((a, b) => b.weight - a.weight).slice(0, 10);
    return { ...data, clusters: cl, topConnections: tc };
  }, [cases, suspects, evidence, selectedCaseId]);

  // Initial Selected Node
  useEffect(() => {
    if (initialSelectedNodeId && nodes.length > 0 && !selectedNode) {
      const node = nodes.find(n => n.id === initialSelectedNodeId);
      if (node) setSelectedNode(node);
    }
  }, [initialSelectedNodeId, nodes, selectedNode]);

  // Derived graphData state for ForceGraph
  const graphData = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({ ...e }))
  }), [nodes, edges]);

  // Tune D3 Forces for better spacing
  useEffect(() => {
    if (fgRef.current && containerDimensions.width > 0) {
      // Compact clustering as requested
      fgRef.current.d3Force('charge').strength(-200);
      
      // Decrease link distance
      fgRef.current.d3Force('link').distance(80);
    }
  }, [graphData, containerDimensions, nodes.length]);

  // Auto-fit when graph data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(800, 30); // 800ms transition, 30px padding
      }
    }, 1200); // Wait for initial simulation to settle
    return () => clearTimeout(timer);
  }, [graphData, selectedCaseId]);

  // Handle Search Zooming
  useEffect(() => {
    if (searchTerm && fgRef.current) {
      const targetNode = graphData.nodes.find(n => n.label.toLowerCase().includes(searchTerm.toLowerCase()));
      if (targetNode) {
        fgRef.current.centerAt(targetNode.x, targetNode.y, 800);
        fgRef.current.zoom(2.5, 800);
      }
    }
  }, [searchTerm, graphData.nodes]);

  // Compute metrics dynamically
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const highRiskCount = nodes.filter(n => n.riskScore > 80).length;
  const threatLevel = totalNodes > 0 ? Math.round(nodes.reduce((acc, curr) => acc + curr.riskScore, 0) / totalNodes) : 0;

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(nodes.find(n => n.id === node.id) || node);
    setAiAnalysis(null);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(2.5, 800);
    }
  }, [nodes]);

  const handleAnalyzeAi = async () => {
    if (!selectedNode) return;
    setIsAiLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Analyze connections of ${selectedNode.label} (${selectedNode.id})` }),
      });
      if (!response.ok) throw new Error('AI analysis failed');
      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      setAiAnalysis({ finding: 'NEXUS-AI Error: Could not connect to backend analysis engine.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoverNode?.id === node.id;
    const isSearched = searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase());
    const isKingpin = node.type === 'LEADER';
    const isImportant = node.riskScore > 80;
    
    const color = NODE_COLORS[node.type] || NODE_COLORS['DEFAULT'];
    
    // Scale node sizes (reduced by 25%)
    let baseRadius = 10.5;
    if (isKingpin) baseRadius = 18;
    else if (isImportant) baseRadius = 13.5;
    
    if (isSelected || isSearched) baseRadius += 4.5;
    if (isHovered) baseRadius += 1.5;

    // Draw glow
    if (isSelected || isSearched || isImportant) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + (isSelected || isSearched ? 10.5 : 7.5), 0, 2 * Math.PI, false);
      ctx.fillStyle = isSearched ? '#facc15' : color;
      ctx.globalAlpha = (isSelected || isSearched) ? 0.6 : 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Main node
    ctx.beginPath();
    ctx.arc(node.x, node.y, baseRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = isHovered ? 1.5 : 0.75;
    ctx.stroke();

    // Draw Label with good contrast and scaling
    // Only draw labels if we're zoomed in enough, OR if it's an important node, OR if it's hovered/selected
    if (globalScale > 0.8 || isSelected || isHovered || isSearched || isKingpin) {
      const label = node.label;
      const fontSize = (isKingpin ? 12 : 10) / Math.max(globalScale, 0.4);
      
      ctx.font = `600 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Halo for readability
      ctx.shadowColor = '#050811';
      ctx.shadowBlur = 4.5;
      ctx.lineWidth = 2.25;
      ctx.strokeStyle = '#050811';
      ctx.strokeText(label, node.x, node.y + baseRadius + (fontSize));
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = isSelected || isSearched ? '#fff' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, node.x, node.y + baseRadius + (fontSize));
    }
  }, [selectedNode, hoverNode, searchTerm]);

  const drawEdge = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const isConnected = selectedNode && (link.source.id === selectedNode.id || link.target.id === selectedNode.id);
    
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    
    if (link.type === 'MONEY_FLOW') {
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)'; // Green
    } else if (link.type === 'GANG_HIERARCHY') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Red
    } else if (link.type === 'CDR_CALL') {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'; // Cyan
    } else {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; // Purple
    }

    ctx.lineWidth = isConnected ? Math.max(2, link.weight * 0.8) : link.weight * 0.5;
    ctx.globalAlpha = (selectedNode && !isConnected) ? 0.08 : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [selectedNode]);

  const selectedSuspectDetails = selectedNode ? suspects.find(s => s.id === selectedNode.id) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)', gap: '16px' }}>
      
      {/* 1. TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Network size={24} style={{ color: 'var(--accent-cyan)' }} />
            Syndicate Network Topology
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            Visualize connections, uncover hidden relationships, and analyze criminal networks.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={selectedCaseId} 
            onChange={(e) => { setSelectedCaseId(e.target.value); setSelectedNode(null); }}
            className="input-field"
            style={{ padding: '8px 12px', fontSize: '0.8rem', width: '200px' }}
          >
            <option value="ALL">All Cases (Global Network)</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={() => fgRef.current?.zoomToFit(800, 30)}>
            <Maximize2 size={16} /> Full Interactive Graph ↗
          </button>
          <button className="btn btn-primary" onClick={handleAnalyzeAi} disabled={isAiLoading || !selectedNode}>
            {isAiLoading ? <Loader2 size={16} className="radar-spinner" /> : <Bot size={16} />} 
            Analyze with NEXUS-AI ▼
          </button>
        </div>
      </div>

      {/* 2. NETWORK STATISTICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {[
          { label: 'Syndicate Nodes', value: totalNodes, color: 'var(--accent-blue)' },
          { label: 'Cross-Links', value: totalEdges, color: 'var(--accent-cyan)' },
          { label: 'High-Risk Entities', value: highRiskCount, color: 'var(--accent-red)' },
          { label: 'Network Clusters', value: clusters.length, color: 'var(--accent-amber)' },
          { label: 'Network Threat Level', value: `${threatLevel > 70 ? 'High' : threatLevel > 40 ? 'Medium' : 'Low'} — ${threatLevel}%`, color: threatLevel > 70 ? 'var(--accent-red)' : 'var(--accent-amber)' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `2px solid ${stat.color}` }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{stat.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA - Substantially Increased Height */}
      <div style={{ display: 'flex', gap: '16px', width: '100%', minHeight: 'clamp(410px, 44vh, 510px)' }}>
        
        {/* GRAPH CONTAINER */}
        <div className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }} ref={containerRef}>
          
          {/* Node Type Legend & Search Grouped on Left */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(5, 8, 17, 0.85)', padding: '9px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>Node Types</div>
              {[
                { label: 'Kingpin', color: '#ef4444' },
                { label: 'Operator', color: '#f97316' },
                { label: 'Finance', color: '#22c55e' },
                { label: 'Cyber / Comms', color: '#06b6d4' },
                { label: 'Front Company', color: '#a855f7' },
                { label: 'Associate', color: '#3b82f6' }
              ].map((type) => (
                <div key={type.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', fontSize: '0.65rem', color: '#fff' }}>
                  <div style={{ width: '7.5px', height: '7.5px', borderRadius: '50%', background: type.color }}></div>
                  {type.label}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(5,8,17,0.85)', padding: '6px 9px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(4px)' }}>
              <Search size={12} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search entity..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', width: '98px' }}
              />
            </div>
          </div>

          {/* Graph Toolbar */}
          <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button className="btn btn-secondary" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.4, 400)} style={{ padding: '6px' }}><ZoomIn size={12} /></button>
            <button className="btn btn-secondary" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.4, 400)} style={{ padding: '6px' }}><ZoomOut size={12} /></button>
            <button className="btn btn-secondary" onClick={() => fgRef.current?.zoomToFit(800, 30)} style={{ padding: '6px' }}><Maximize2 size={12} /></button>
            <button className="btn btn-secondary" onClick={() => { setSelectedNode(null); fgRef.current?.zoomToFit(800, 30); }} style={{ padding: '6px' }}><Crosshair size={12} /></button>
          </div>

          {/* Force Graph */}
          {containerDimensions.width > 0 && nodes.length > 0 ? (
            <ForceGraph2D
              ref={fgRef}
              width={containerDimensions.width}
              height={containerDimensions.height}
              graphData={graphData}
              nodeLabel="label"
              nodeRelSize={6}
              linkColor={() => 'rgba(255,255,255,0)'} // Hide default lines as we draw custom
              nodeCanvasObject={drawNode}
              linkCanvasObjectMode={() => 'replace'}
              linkCanvasObject={drawEdge}
              onNodeClick={handleNodeClick}
              onNodeHover={(node) => setHoverNode(node as NetworkNode)}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.2} // Allow slightly longer settling
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <Network size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No network relationships available for this case.</p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - ENTITY DETAILS */}
        {selectedNode && selectedSuspectDetails && (
          <div className="glass-panel" style={{ width: '28%', minWidth: '320px', maxWidth: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderLeft: '1px solid var(--border-cyan)' }}>
            
            <div style={{ padding: '20px', background: 'rgba(15,23,42,0.6)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                {selectedNode.riskScore > 80 && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '1px', marginBottom: '4px' }}>[Synthetic High Risk]</div>
                )}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{selectedSuspectDetails.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{selectedSuspectDetails.alias ? `"${selectedSuspectDetails.alias}"` : selectedSuspectDetails.role}</div>
              </div>
              <button onClick={() => setSelectedNode(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {aiAnalysis ? (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Bot size={14}/> NEXUS-AI Insights</h4>
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--border-cyan)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#fff', lineHeight: 1.5 }}>
                    {aiAnalysis.finding}
                  </div>
                  {aiAnalysis.suggestedNextStep && (
                    <div style={{ marginTop: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '2px solid var(--accent-red)', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Action:</strong> {aiAnalysis.suggestedNextStep}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '12px' }}>Analytical Overview</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Analytical Case Priority</div>
                        <div style={{ color: selectedNode.riskScore > 80 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>{selectedNode.riskScore}/100</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Syndicate</div>
                        <div style={{ color: '#fff' }}>{selectedSuspectDetails.syndicate}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Last Location</div>
                        <div style={{ color: '#fff' }}>{selectedSuspectDetails.lastKnownLocation}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Case Associations</div>
                        <div style={{ color: '#fff' }}>{selectedSuspectDetails.associatedCaseIds.length}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
                      *Analytical indicator for investigation workflow only; not a determination of guilt.
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '8px' }}>Short Profile</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {(() => {
                        const associatedCase = cases.find(c => c.suspectIds.includes(selectedSuspectDetails.id));
                        if (associatedCase && associatedCase.isPublicRecord) {
                          return `Public judicial case record associated with ${associatedCase.title}. This CRIMENET entity represents the case record and its documented investigation information.`;
                        }
                        return `Synthetic entity ${selectedSuspectDetails.name} (${selectedSuspectDetails.id}) is actively monitored under CRIMENET protocol. Suspected involvement in high-level operations for ${selectedSuspectDetails.syndicate}.`;
                      })()}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => onNavigate('suspects', { suspect: selectedSuspectDetails })}>
                View Full Dossier <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', minHeight: '220px', paddingBottom: '20px' }}>
        
        {/* Network Activity Timeline */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart2 size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Network Activity Timeline</h3>
          </div>
          <div style={{ flex: 1, minHeight: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TIMELINE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-red)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-red)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--border-subtle)" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <YAxis stroke="var(--border-subtle)" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0a0f1d', border: '1px solid var(--border-cyan)', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="highRisk" stroke="var(--accent-red)" fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="medium" stroke="var(--accent-amber)" fillOpacity={1} fill="url(#colorMedium)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Connections */}
        <div className="glass-panel" style={{ padding: '20px', overflowY: 'auto', maxHeight: '250px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Top Connections</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topConnections.length > 0 ? topConnections.map((conn, idx) => {
              const srcLabel = typeof conn.source === 'object' ? (conn.source as any).label : (nodes.find(n => n.id === conn.source)?.label || conn.source);
              const tgtLabel = typeof conn.target === 'object' ? (conn.target as any).label : (nodes.find(n => n.id === conn.target)?.label || conn.target);
              const weightFrac = Math.min(conn.weight / 5, 1);
              return (
              <div key={conn.id} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) 45px 75px', gap: '8px', alignItems: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                <div title={`${srcLabel} → ${tgtLabel}`} style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{srcLabel}</span>
                  <ArrowRight size={10} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tgtLabel}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', textAlign: 'right' }}>
                  {(weightFrac).toFixed(2)}
                </div>
                <div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${weightFrac * 100}%`, height: '100%', background: weightFrac > 0.8 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}></div>
                  </div>
                </div>
              </div>
            )}) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No connections found</div>
            )}
          </div>
        </div>

        {/* Network Clusters */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '250px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Network Clusters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {clusters.length > 0 ? clusters.map((cluster) => {
              const types = cluster.nodes.map(n => n.type);
              let name = 'Mixed Cluster';
              if (types.includes('LEADER')) name = 'Core Syndicate';
              else if (types.every(t => t === 'FINANCIER' || t === 'FRONT_COMPANY')) name = 'Financial Network';
              else if (types.every(t => t === 'COMM_NODE')) name = 'Cyber Network';
              else if (types.every(t => t === 'COURIER' || t === 'OPERATIVE')) name = 'Operations Group';

              return (
              <div key={cluster.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#fff' }}>{cluster.id}. {name}</span>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                  <span>{cluster.nodes.length} nodes</span>
                  <span style={{ color: 'var(--accent-amber)' }}>{cluster.avgRisk}%</span>
                </div>
              </div>
            )}) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No clusters detected</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
