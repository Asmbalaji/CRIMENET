import React, { useState } from 'react';
import { Bot, Send, Sparkles, Brain, Cpu, Shield, ArrowRight, UserCheck, HardDrive, RefreshCw } from 'lucide-react';
import { AI_PROMPT_SUGGESTIONS } from '../data/mockData';
import { ViewId } from '../components/Sidebar';

interface Message {
  id: string;
  sender: 'USER' | 'NEXUS';
  text: string;
  timestamp: string;
  confidence?: number;
  dataPoints?: string[];
  structured?: {
    answer: string;
    keyEntities: { id: string; label: string }[];
    detectedPattern: string;
    supportingEvidence: { id: string; label: string }[];
    confidence: number;
    nextStep: string;
  };
}

interface AiInvestigationViewProps {
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const AiInvestigationView: React.FC<AiInvestigationViewProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'NEXUS',
      text: 'NEXUS-AI Neural Intelligence System online. Ready to analyze verified investigation records. How can I assist you today?',
      timestamp: '13:40',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [thinking, setThinking] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'USER',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setThinking(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'NEXUS',
        text: '', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structured: {
          answer: data.finding || 'Insufficient evidence.',
          keyEntities: data.supportingEntities || [],
          detectedPattern: data.detectedPattern || 'None detected.',
          supportingEvidence: data.supportingEvidence || [],
          confidence: data.confidence || 0,
          nextStep: data.suggestedNextStep || 'Awaiting further investigation.'
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'NEXUS',
        text: 'NEXUS-AI Error: Could not connect to backend analysis engine or Groq API key is missing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={28} style={{ color: 'var(--accent-cyan)' }} /> NEXUS AI Investigation Assistant
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            NEURAL NETWORK REASONING ENGINE • SIH DEMO MODEL
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">NEURAL ENGINE: ONLINE</span>
          <span className="badge badge-cyan">MODEL: SIH-NEXUS-v2.4</span>
        </div>
      </div>

      {/* Chat Container + Prompt Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Chat History Panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#0a0f1d' }}>
          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'USER' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: msg.sender === 'USER' ? 'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(59,130,246,0.2) 100%)' : 'rgba(15, 23, 42, 0.9)',
                    border: msg.sender === 'USER' ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                    boxShadow: msg.sender === 'USER' ? '0 0 15px var(--accent-cyan-glow)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.sender === 'USER' ? 'var(--accent-cyan)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      {msg.sender === 'USER' ? 'INVESTIGATOR' : 'NEXUS-AI NEURAL ENGINE'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.sender === 'NEXUS' && <span className="badge badge-medium" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>SYNTHETIC AI ANALYSIS</span>}
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Render Standard Text */}
                  {msg.text && (
                    <p style={{ fontSize: '0.875rem', color: '#ffffff', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {msg.text}
                    </p>
                  )}

                  {/* Render Structured AI Output */}
                  {msg.structured && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                      <p style={{ color: '#ffffff', lineHeight: 1.5 }}>{msg.structured.answer}</p>
                      
                      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
                        <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>KEY ENTITIES</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {msg.structured.keyEntities.map((ent, i) => (
                            <button key={i} className="badge badge-cyan" style={{ cursor: 'pointer', border: 'none' }} onClick={() => onNavigate('network', { nodeId: ent.id })}>
                              {ent.label} <ArrowRight size={10} style={{ marginLeft: '4px' }} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--accent-amber)' }}>
                        <div style={{ color: 'var(--accent-amber)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>DETECTED PATTERN</div>
                        <div style={{ color: '#ffffff' }}>{msg.structured.detectedPattern}</div>
                      </div>

                      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid var(--accent-blue)' }}>
                        <div style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.75rem', marginBottom: '4px' }}>SUPPORTING EVIDENCE</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {msg.structured.supportingEvidence.map((ev, i) => (
                            <button key={i} className="badge badge-blue" style={{ cursor: 'pointer', border: 'none' }} onClick={() => onNavigate('evidence', { evidenceId: ev.id })}>
                              {ev.label} <ArrowRight size={10} style={{ marginLeft: '4px' }} />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--accent-emerald)' }}>CONFIDENCE: {msg.structured.confidence}%</strong> (Synthetic Demo)
                         </div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            <strong>NEXT:</strong> {msg.structured.nextStep}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                <Cpu size={18} className="radar-spinner" /> Processing Neural Network Data Nodes...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ask NEXUS-AI e.g. 'Predict high risk leads for Case 091'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <button onClick={() => handleSend()} className="btn btn-primary" style={{ padding: '0 20px' }}>
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* AI Prompt Suggestions Side Panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-title" style={{ fontSize: '1rem', color: 'var(--accent-cyan)' }}>
            <Sparkles size={18} /> Suggested AI Queries
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Click prompt chip to execute instant automated analysis:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {AI_PROMPT_SUGGESTIONS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
