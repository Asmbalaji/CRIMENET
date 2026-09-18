import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Brain, Cpu, Shield, ArrowRight, UserCheck, HardDrive, RefreshCw, X, MessageSquare, PlusCircle } from 'lucide-react';
import { ViewId } from '../components/Sidebar';

interface Message {
  id: string;
  sender: 'USER' | 'NEXUS';
  text: string;
  timestamp: string;
  sources?: string[];
  caseIds?: string[];
  entityIds?: string[];
  evidenceIds?: string[];
  locationIds?: string[];
  relationshipIds?: string[];
}

interface AiInvestigationViewProps {
  onNavigate: (view: ViewId, payload?: any) => void;
  caseId?: string | null;
}

const generateUUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const AiInvestigationView: React.FC<AiInvestigationViewProps> = ({ onNavigate, caseId }) => {
  const [conversationId, setConversationId] = useState<string>(generateUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [targetCaseId, setTargetCaseId] = useState<string | null>(caseId || null);
  const [responseLanguage, setResponseLanguage] = useState<string>('English');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Initial Case load
  useEffect(() => {
    if (caseId && messages.length === 0) {
      setTargetCaseId(caseId);
      // Not auto-sending, but ready to answer about case
    }
  }, [caseId, messages.length]);

  const handleClearChat = async () => {
    try {
      await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', conversationId }),
      });
    } catch (e) {
      console.error(e);
    }
    setConversationId(generateUUID());
    setMessages([]);
    setTargetCaseId(null);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isThinking) return;

    const userMsg: Message = {
      id: generateUUID(),
      sender: 'USER',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    try {
      const prompt = `[Response Language: ${responseLanguage}] ${text}`;
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt, 
          caseId: targetCaseId,
          conversationId 
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      const aiMsg: Message = {
        id: generateUUID(),
        sender: 'NEXUS',
        text: data.answer || 'No valid response received.', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        caseIds: data.caseIds || [],
        entityIds: data.entityIds || [],
        evidenceIds: data.evidenceIds || [],
        locationIds: data.locationIds || [],
        relationshipIds: data.relationshipIds || []
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: generateUUID(),
        sender: 'NEXUS',
        text: 'NEXUS-AI is temporarily unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = targetCaseId ? [
    "What evidence is associated with this case?",
    "Who are the documented persons?",
    "What locations are mentioned?",
    "Summarize the case.",
    "Are there cross-case connections?"
  ] : [
    "Summarize the active cases",
    "Which entities appear in multiple cases?",
    "Show cross-case connections",
    "Find shared entities between cases"
  ];

  const renderIds = (ids: string[], type: string, view: ViewId) => {
    if (!ids || ids.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        {ids.map(id => (
          <button 
            key={id}
            onClick={() => onNavigate(view, type === 'case' ? { id } : {})}
            className="badge badge-cyan" 
            style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--accent-cyan)' }}
          >
            {id} <ArrowRight size={10} style={{ marginLeft: '4px' }} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={28} style={{ color: 'var(--accent-cyan)' }} /> NEXUS-AI Investigation Assistant
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {targetCaseId ? `CURRENT CONTEXT: ${targetCaseId}` : 'GLOBAL INVESTIGATION MODE'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            value={responseLanguage}
            onChange={e => setResponseLanguage(e.target.value)}
            className="input-field"
            style={{ width: '140px', padding: '6px 10px', fontSize: '0.8rem' }}
          >
            {['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu'].map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={handleClearChat} style={{ fontSize: '0.8rem' }}>
            <PlusCircle size={14} /> New Conversation
          </button>
          <span className="badge badge-emerald">● ONLINE</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#0a0f1d' }}>
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '16px' }}>
              <Brain size={48} style={{ opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>How can I help with the investigation?</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                {SUGGESTIONS.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleSend(s)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)' }}
                  >
                    <MessageSquare size={14} /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  maxWidth: '85%',
                  minWidth: '250px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: msg.sender === 'USER' ? 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(59,130,246,0.15) 100%)' : 'rgba(15, 23, 42, 0.95)',
                  border: msg.sender === 'USER' ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                  boxShadow: msg.sender === 'USER' ? '0 0 15px var(--accent-cyan-glow)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.sender === 'USER' ? 'var(--accent-cyan)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    {msg.sender === 'USER' ? 'INVESTIGATOR' : 'NEXUS-AI'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {msg.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {msg.sender === 'NEXUS' && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                        <strong>Sources:</strong> {msg.sources.join(', ')}
                      </div>
                    )}
                    
                    {renderIds(msg.caseIds || [], 'case', 'cases')}
                    {renderIds(msg.entityIds || [], 'entity', 'suspects')}
                    {renderIds(msg.evidenceIds || [], 'evidence', 'evidence')}
                    {renderIds(msg.locationIds || [], 'location', 'map')}
                    {renderIds(msg.relationshipIds || [], 'relationship', 'cross-case')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-subtle)' }}>
                <span className="badge badge-emerald">
                  <RefreshCw size={12} className="radar-spinner" style={{ marginRight: '6px' }} /> NEXUS-AI is analyzing...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(5, 8, 17, 0.9)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <textarea
              className="input-field"
              placeholder={targetCaseId ? `Ask NEXUS-AI about ${targetCaseId}...` : "Ask NEXUS-AI about cases, entities, evidence, locations or relationships..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isThinking}
              rows={2}
              style={{ flex: 1, resize: 'none', fontFamily: 'var(--font-sans)', padding: '12px 16px' }}
            />
            <button 
              className="btn btn-primary" 
              onClick={() => handleSend()}
              disabled={isThinking || !inputText.trim()}
              style={{ padding: '12px 24px', height: '100%' }}
            >
              <Send size={18} /> Send
            </button>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            Press Enter to send, Shift + Enter for new line. Analytical risk indicators are not determinations of guilt.
          </div>
        </div>
      </div>
    </div>
  );
};
