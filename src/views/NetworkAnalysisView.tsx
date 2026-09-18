import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useData } from '../context/DataContext';
import { NetworkNode } from '../data/mockData';
import { buildNetworkFromCases } from '../utils/networkBuilder';
import { X, Maximize2, ZoomIn, ZoomOut, Search, Activity } from 'lucide-react';

interface NetworkAnalysisViewProps {
  initialSelectedNodeId?: string | null;
  initialEvidenceId?: string | null;
  onNavigate: (view: any, payload?: any) => void;
}

const NODE_COLORS: Record<string, string> = {
  'LEADER': '#ef4444',
  'OPERATIVE': '#f97316',
  'FINANCIER': '#22c55e',
  'FRONT_COMPANY': '#a855f7',
  'COMM_NODE': '#06b6d4',
  'DEFAULT': '#3b82f6'
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', zIndex: 9999, position: 'absolute', top: 50, left: 50, background: 'black', padding: 20 }}>
        <h1>React Error</h1>
        <pre>{this.state.error?.toString()}</pre>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

const Widget = ({ value, label, color }: { value: string, label: string, color: string }) => (
  <div className="ultra-glass-panel w-full" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: `2px solid ${color}` }}>
    <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '1px' }}>{label}</div>
  </div>
);



const NetworkAnalysisViewComponent: React.FC<NetworkAnalysisViewProps> = ({ initialSelectedNodeId, onNavigate }) => {
  const { cases, suspects, evidence, crossCaseLinks } = useData();
  const fgRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoverNode, setHoverNode] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      if (!Array.isArray(entries) || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      setContainerDimensions({ width, height });
    });

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Build the network
  const { nodes, edges } = useMemo(() => {
    const data = buildNetworkFromCases(cases, suspects, evidence, crossCaseLinks, 'ALL');
    const coreNodes = data.nodes;
    const finalNodes: any[] = [];
    const finalEdges = [...data.edges];

    const vikram = coreNodes.find(n => n.label?.includes('Vikramaditya')) || coreNodes.find(n => n.type === 'LEADER') || coreNodes[0];
    const topAssociates = coreNodes.filter(n => n.id !== vikram?.id).slice(0, 4);
    const secondaryNodes = coreNodes.filter(n => n.id !== vikram?.id && topAssociates.findIndex(a => a.id === n.id) === -1);

    // Sort to keep consistent layout
    secondaryNodes.sort((a, b) => a.type.localeCompare(b.type));

    coreNodes.forEach(n => {
      let fx = undefined;
      let fy = undefined;

      if (n.id === vikram?.id) {
        fx = 0; fy = 0;
      } else {
        const idx = topAssociates.findIndex(a => a.id === n.id);
        if (idx !== -1) {
          // Left-side radial star: 90, 135, 225, 270 degrees
          const angles = [Math.PI / 2, Math.PI - Math.PI / 4, Math.PI + Math.PI / 4, 3 * Math.PI / 2];
          const angle = angles[idx];
          fx = 200 * Math.cos(angle);
          fy = 200 * Math.sin(angle);
        } else {
          // Branch out to the right in a grid/tree formation
          const sIdx = secondaryNodes.findIndex(sn => sn.id === n.id);
          const col = Math.floor(sIdx / 4);
          const row = sIdx % 4;
          fx = 250 + col * 120 + (row % 2 === 0 ? 0 : 40);
          fy = -150 + row * 100;
        }
      }
      finalNodes.push({ ...n, fx, fy, isKingpin: n.id === vikram?.id });
    });

    return { nodes: finalNodes, edges: finalEdges };
  }, [cases, suspects, evidence]);

  const [hasInitializedNode, setHasInitializedNode] = useState(false);

  useEffect(() => {
    if (initialSelectedNodeId && nodes.length > 0 && !hasInitializedNode) {
      const node = nodes.find(n => n.id === initialSelectedNodeId);
      if (node) {
        setSelectedNode(node);
      }
      setHasInitializedNode(true);
    }
  }, [initialSelectedNodeId, nodes, hasInitializedNode]);

  const graphData = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({ ...e }))
  }), [nodes, edges]);

  useEffect(() => {
    if (fgRef.current && containerDimensions.width > 0) {
      fgRef.current.d3Force('charge').strength(-120);
      fgRef.current.d3Force('link').distance(50);
      fgRef.current.d3Force('center').strength(0.1);
    }
  }, [graphData, containerDimensions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.zoomToFit(1200, 100);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [graphData]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(nodes.find(n => n.id === node.id) || node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(2.5, 800);
    }
  }, [nodes]);

  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (typeof node.x !== 'number' || typeof node.y !== 'number') return;

    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoverNode?.id === node.id;
    const isSearched = searchTerm && node.label?.toLowerCase().includes(searchTerm.toLowerCase());
    const isKingpin = node.isKingpin;

    const baseColor = NODE_COLORS[node.type] || NODE_COLORS['DEFAULT'];

    let baseRadius = 8;
    if (isKingpin) baseRadius = 14;
    if (isSelected || isHovered || isSearched) baseRadius += 3;

    ctx.beginPath();
    ctx.arc(node.x, node.y, baseRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = baseColor;
    ctx.fill();

    if (isKingpin) {
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();

    if (isSelected || isSearched) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    const showLabel = globalScale > 1.2 || isSelected || isHovered || isSearched || isKingpin;
    if (showLabel && node.label) {
      const label = node.label;
      const fontSize = isKingpin ? 14 / globalScale : 12 / globalScale;
      ctx.font = `600 ${fontSize}px var(--font-sans)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      ctx.fillStyle = isSelected || isSearched ? '#fff' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(label, node.x, node.y + baseRadius + 4);
    }
  }, [selectedNode, hoverNode, searchTerm]);

  const drawEdge = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
    const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);

    if (!sourceNode || !targetNode || typeof sourceNode.x !== 'number' || typeof sourceNode.y !== 'number' || typeof targetNode.x !== 'number' || typeof targetNode.y !== 'number') return;

    const isConnected = selectedNode && (sourceNode.id === selectedNode.id || targetNode.id === selectedNode.id);

    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.lineTo(targetNode.x, targetNode.y);

    let color = '#475569';
    if (isConnected) {
      color = '#94a3b8';
      ctx.lineWidth = 2 / globalScale;
    } else {
      ctx.lineWidth = 1 / globalScale;
    }

    ctx.strokeStyle = color;
    ctx.stroke();
  }, [nodes, selectedNode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* 1. Top Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <span style={{ color: '#22d3ee', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>● LIVE INTEL FEED</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginTop: '4px', fontFamily: 'var(--font-display)' }}>NETWORK INTEL MODULE - PROJECT CRIMENET</h1>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>T-STAMP: 15-09-2026 // RESTRICTED ACCESS</p>
        </div>
      </div>

      {/* 2. Main Content Split */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, gap: '24px' }}>
        
        {/* LEFT SIDE: The Graph Canvas */}
        <div style={{ flex: 1, position: 'relative', background: '#0d1117', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }} ref={containerRef}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
            {containerDimensions.width > 0 && containerDimensions.height > 0 && nodes.length > 0 && (
              <ForceGraph2D
                ref={fgRef}
                width={containerDimensions.width}
                height={containerDimensions.height}
                graphData={{ nodes, links: edges }}
                nodeLabel={() => ''}
                nodeRelSize={6}
                linkColor={() => 'rgba(255,255,255,0)'}
                nodeCanvasObject={drawNode}
                linkCanvasObjectMode={() => 'replace'}
                linkCanvasObject={drawEdge}
                onNodeClick={handleNodeClick}
                onNodeHover={(node) => setHoverNode(node as NetworkNode)}
                enableNodeDrag={false}
                warmupTicks={100}
                cooldownTicks={100}
                d3AlphaDecay={0.05}
                d3VelocityDecay={0.4}
              />
            )}
          </div>

          {/* Search & Legend Left Panel (Inside Left Column) */}
          <div className="ultra-glass-panel" style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 20, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', width: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5,8,17,0.7)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search entity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', width: '100%' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '12px', letterSpacing: '1px' }}>NODE TYPES</div>
              {[
                { label: 'Kingpin / Leader', color: '#ef4444' },
                { label: 'Operative', color: '#f97316' },
                { label: 'Financier', color: '#22c55e' },
                { label: 'Cyber / Comms', color: '#06b6d4' },
                { label: 'Front Company', color: '#a855f7' }
              ].map((type) => (
                <div key={type.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.75rem', color: '#fff' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: type.color, boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.5), 0 0 10px ${type.color}` }}></div>
                  {type.label}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Node Panel (Inside Left Column) */}
          {selectedNode && (
            <div 
              style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                zIndex: 1000, 
                width: '360px', 
                background: 'rgba(11, 15, 25, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                cursor: 'default',
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginBottom: '4px' }}>ENTITY PROFILE</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{selectedNode.label}</h3>
                  {(() => {
                    const sus = suspects.find((s: any) => s.id === selectedNode.id);
                    if (sus?.nameOriginal) {
                      return (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                          Original: {sus.nameOriginal} ({sus.originalLanguage})
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>ID: {selectedNode.id}</div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedNode(null);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedNode(null);
                  }} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '6px',
                    color: 'var(--text-secondary)', 
                    cursor: 'pointer', 
                    padding: '6px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    pointerEvents: 'auto'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>THREAT SCORE</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: selectedNode.riskScore > 50 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                    {Math.round(selectedNode.riskScore)}/100
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>NETWORK ROLE</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{selectedNode.type}</div>
                </div>
              </div>

              {/* Nexus-AI Insight */}
              <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Activity size={14} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>NEXUS-AI AUTO-INSIGHT</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedNode.isSynthetic
                    ? 'Peripheral synthetic node detected through secondary communication layers. Low certainty of direct involvement.'
                    : 'Primary verified target. Extensive historical data across multiple active investigations. High priority target.'}
                </p>
              </div>

              {/* Action */}
              {!selectedNode.isSynthetic && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('suspects', { suspect: suspects.find((s: any) => s.id === selectedNode.id) });
                  }} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem', pointerEvents: 'auto' }}
                >
                  Extract Full Dossier
                </button>
              )}
            </div>
          )}

          {/* Tool Controls Bottom Right (Inside Left Column) */}
          <div className="vertical-controls" style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 20 }}>
            <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.4, 400)}><ZoomIn size={18} /></button>
            <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.4, 400)}><ZoomOut size={18} /></button>
            <button onClick={() => fgRef.current?.zoomToFit(800, 30)}><Maximize2 size={18} /></button>
          </div>
        </div>

        <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', background: '#0d1117', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px' }}>
          <Widget value={cases.filter((c: any) => c.status === 'ACTIVE').length.toString()} label="ACTIVE INVESTIGATIONS" color="var(--accent-blue)" />
          <Widget value={suspects.length.toString()} label="TARGETS OF INTEREST" color="var(--accent-amber)" />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0' }}>
            <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(10, 15, 29, 0.6)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <svg width="130" height="130" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="65" cy="65" r="58" fill="none" stroke="var(--accent-red)" strokeWidth="6" strokeDasharray="364" strokeDashoffset={364 * (1 - (suspects.length > 0 ? suspects.filter((s: any) => s.riskScore >= 80).length / suspects.length : 0))} className="animate-pulse-neon radial-gauge-glow" strokeLinecap="round" />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: 'var(--font-display)' }}>{suspects.length > 0 ? Math.round((suspects.filter((s: any) => s.riskScore >= 80).length / suspects.length) * 100) : 0}%</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--accent-red)', fontWeight: 700, letterSpacing: '1px', marginTop: '4px' }}>HIGH RISK</div>
              </div>
            </div>
          </div>

          <Widget value={evidence.filter((e: any) => e.category === 'FINANCIAL_LEDGER').length.toString()} label="FINANCIAL LEDGERS" color="var(--accent-cyan)" />
          <Widget value={suspects.filter((s: any) => s.threatLevel === 'CRITICAL').length.toString()} label="CRITICAL THREATS" color="var(--accent-red)" />
        </div>
      </div>
    </div>
  );
};

export const NetworkAnalysisView = (props: NetworkAnalysisViewProps) => (
  <ErrorBoundary>
    <NetworkAnalysisViewComponent {...props} />
  </ErrorBoundary>
);
