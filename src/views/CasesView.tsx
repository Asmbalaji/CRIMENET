import React, { useState, useRef } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  ArrowRight,
  FileText,
  User,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  HardDrive,
  X,
  UploadCloud,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import { InvestigationCase } from '../data/mockData';
import { useData } from '../context/DataContext';
import { CaseVerificationModal } from '../components/CaseVerificationModal';
import { ViewId } from '../components/Sidebar';

interface CasesViewProps {
  selectedCase: InvestigationCase | null;
  onSelectCase: (c: InvestigationCase | null) => void;
  onNavigate: (view: ViewId, payload?: any) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({ selectedCase, onSelectCase, onNavigate }) => {
  const { cases, suspects, addLocalCase, addLocalSuspect, addLocalEvidence, addLocalLocation } = useData();
  const [caseDocuments, setCaseDocuments] = useState<Record<string, {name: string, type: string}>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  
  const [newTitle, setNewTitle] = useState('');
  const [newSuspectName, setNewSuspectName] = useState('');
  const [newSyndicate, setNewSyndicate] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newSummary, setNewSummary] = useState('');

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<InvestigationCase | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { refreshData } = useData();

  const initiateDelete = (c: InvestigationCase, e: React.MouseEvent) => {
    e.stopPropagation();
    setCaseToDelete(c);
    setDeleteConfirmationText('');
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`http://localhost:5000/api/cases/${caseToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.error || 'Case could not be deleted. Please try again.');
        setIsDeleting(false);
        return;
      }
      
      // Success
      setDeleteModalOpen(false);
      setCaseToDelete(null);
      setIsDeleting(false);
      
      // If we are viewing this case in the dossier, clear it
      if (selectedCase?.id === caseToDelete.id) {
        onSelectCase(null);
      }
      
      // Refresh context
      await refreshData();
      
    } catch (err) {
      setDeleteError('Case could not be deleted. Please try again.');
      setIsDeleting(false);
    }
  };


  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.syndicate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || c.status === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    setUploadError('');
    if (!file) return;
    
    // Validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png)$/i)) {
      setUploadError('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, JPG, or PNG.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds the 10 MB limit.');
      return;
    }
    
    setUploadedDocument(file);
  };

  const handleExtractData = async () => {
    if (!uploadedDocument) return;
    setIsExtracting(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadedDocument);

      const response = await fetch('http://localhost:5000/api/cases/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setExtractedData(data.data);
      } else {
        if (data.code === 'AI_EXTRACTION_VALIDATION_ERROR' || data.code === 'AI_INVALID_JSON' || data.code === 'AI_EXTRACTION_FAILED') {
          setUploadError('Document analysis failed. Please try again.');
        } else {
          setUploadError(data.error || data.message || 'AI extraction failed.');
        }
      }
    } catch (err: any) {
      setUploadError('Network error while extracting document data.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateCase = () => {
    if (!newTitle) return;

    let suspectId = '';
    const resolvedName = uploadedDocument && !newSuspectName ? 'Name Pending Verification' : newSuspectName;
    
    if (resolvedName) {
      suspectId = `SUS-NEW-${Math.floor(Math.random() * 10000)}`;
      addLocalSuspect({
        id: suspectId,
        name: resolvedName,
        alias: 'Unknown',
        threatLevel: 'MEDIUM',
        riskScore: 50,
        syndicate: newSyndicate || 'Unknown',
        role: 'Accused',
        status: 'PERSON OF INTEREST',
        lastKnownLocation: 'Unknown',
        phone: 'Unknown',
        avatarColor: '#64748b',
        biometrics: { dnaMatched: false, facialMatchScore: 0, fingerprintRegistered: false },
        associatedCaseIds: [], // Will link below
        riskFactors: { centrality: 0, severity: 20, communication: 0, financial: 0, location: 0 }
      });
    }

    const newCase: InvestigationCase = {
      id: `SIH-CRIM-2026-${Math.floor(Math.random() * 1000)}`,
      caseNumber: `OP-${Math.floor(Math.random() * 10000)}`,
      title: newTitle,
      status: "ACTIVE",
      severity: newSeverity as any,
      dateOpened: new Date().toISOString().split('T')[0],
      leadOfficer: "Agent Synthetic",
      syndicate: newSyndicate || "Unknown",
      suspectIds: suspectId ? [suspectId] : [],
      location: "Unknown Location",
      evidenceCount: uploadedDocument ? 1 : 0,
      summary: newSummary || "No summary provided.",
      isPublicRecord: false
    };
    
    if (uploadedDocument) {
      setCaseDocuments(prev => ({ ...prev, [newCase.id]: { name: uploadedDocument.name, type: uploadedDocument.type } }));
    }
    
    addLocalCase(newCase);
    
    setNewTitle('');
    setNewSuspectName('');
    setNewSyndicate('');
    setNewSeverity('HIGH');
    setNewSummary('');
    setUploadedDocument(null);
    setUploadError('');
    setIsNewCaseModalOpen(false);
  };

  const handleConfirmVerifiedData = async (verifiedData: any) => {
    // Check duplicates
    if (cases.some(c => c.caseNumber === verifiedData.case?.caseNumber || c.firNumber === verifiedData.case?.firNumber)) {
      if (!window.confirm("Possible duplicate case detected. Continue anyway?")) {
        return;
      }
    }

    const newCaseId = `SIH-CRIM-2026-${Math.floor(Math.random() * 1000)}`;
    const suspectIds: string[] = [];
    const newEvidenceId = uploadedDocument ? `EV-EXT-${Math.floor(Math.random() * 10000)}` : undefined;

    // Create suspects
    if (verifiedData.persons && verifiedData.persons.length > 0) {
      verifiedData.persons.forEach((person: any) => {
        const id = `SUS-EXT-${Math.floor(Math.random() * 10000)}`;
        suspectIds.push(id);
        addLocalSuspect({
          id,
          name: person.nameEnglish || 'Name Pending Verification',
          nameOriginal: person.nameOriginal,
          originalLanguage: person.originalLanguage,
          alias: person.aliases?.[0] || 'Unknown',
          threatLevel: person.role?.toLowerCase() === 'accused' ? 'HIGH' : 'MEDIUM',
          riskScore: person.role?.toLowerCase() === 'accused' ? 75 : 30,
          syndicate: 'Unknown',
          role: person.role || 'Unknown',
          status: 'PERSON OF INTEREST',
          lastKnownLocation: 'Unknown',
          phone: 'Unknown',
          avatarColor: '#10b981', // green for extracted
          biometrics: { dnaMatched: false, facialMatchScore: 0, fingerprintRegistered: false },
          associatedCaseIds: [newCaseId],
          riskFactors: { centrality: 10, severity: 20, communication: 0, financial: 0, location: 0 }
        });
      });
    }

    // Create locations
    if (verifiedData.locations && verifiedData.locations.length > 0) {
      verifiedData.locations.forEach((loc: any) => {
        addLocalLocation({
          id: `LOC-EXT-${Math.floor(Math.random() * 10000)}`,
          caseId: newCaseId,
          title: loc.nameEnglish || 'Unknown Location',
          titleOriginal: loc.nameOriginal,
          originalLanguage: loc.originalLanguage,
          city: loc.city || 'Unknown City',
          district: loc.district || undefined,
          state: loc.state || undefined,
          lat: null, // Geocoded on backend
          lng: null,
          type: 'GENERAL_LOCATION',
          threatLevel: (newSeverity as 'CRITICAL' | 'HIGH' | 'MEDIUM') || 'MEDIUM',
          timestamp: new Date().toISOString(),
          sourcePages: loc.sourcePages || [],
          sourceEvidenceId: newEvidenceId,
          verified: true
        });
      });
    }

    // Create extracted evidence items
    if (verifiedData.evidence && verifiedData.evidence.length > 0) {
      verifiedData.evidence.forEach((ev: any) => {
        addLocalEvidence({
          id: `EV-EXT-${Math.floor(Math.random() * 10000)}`,
          caseId: newCaseId,
          title: ev.descriptionEnglish || 'Unknown Evidence',
          titleOriginal: ev.descriptionOriginal,
          originalLanguage: ev.originalLanguage,
          category: 'DOCUMENT', // fallback
          timestamp: new Date().toISOString(),
          source: 'FIR Extraction',
          confidenceScore: 80,
          summary: ev.type || '',
          sourcePages: ev.sourcePages || [],
          sourceEvidenceId: newEvidenceId,
          verified: true
        });
      });
    }

    const newCase: InvestigationCase = {
      id: newCaseId,
      caseNumber: verifiedData.case?.caseNumber || `OP-${Math.floor(Math.random() * 10000)}`,
      firNumber: verifiedData.case?.firNumber || undefined,
      title: verifiedData.case?.caseTitle || newTitle || 'Untitled Case',
      status: "ACTIVE",
      severity: "HIGH",
      dateOpened: verifiedData.case?.firDate || new Date().toISOString().split('T')[0],
      leadOfficer: "Agent Synthetic",
      syndicate: "Unknown",
      suspectIds: suspectIds,
      location: verifiedData.case?.district ? `${verifiedData.case.district}, ${verifiedData.case.state}` : "Unknown Location",
      evidenceCount: verifiedData.evidence?.length || (uploadedDocument ? 1 : 0),
      summary: verifiedData.summary || newSummary || "No summary provided.",
      isPublicRecord: false
    };

    if (uploadedDocument && newEvidenceId) {
      setCaseDocuments(prev => ({ ...prev, [newCase.id]: { name: uploadedDocument.name, type: uploadedDocument.type } }));
      // Generate Evidence Record
      addLocalEvidence({
        id: newEvidenceId,
        caseId: newCaseId,
        title: uploadedDocument.name,
        category: 'DOCUMENT',
        timestamp: new Date().toISOString(),
        source: 'PDF Upload',
        confidenceScore: 100,
        summary: `Uploaded FIR/Case document automatically generated by extraction process.`,
        metadata: { type: uploadedDocument.type }
      });
    }

    await addLocalCase(newCase);
    setExtractedData(null);
    setUploadedDocument(null);
    setUploadError('');
    setIsNewCaseModalOpen(false);

    // Trigger cross-case analysis
    try {
      fetch(`http://localhost:5000/api/cases/${newCaseId}/analyze-links`, { method: 'POST' }).then(() => {
        alert('Cross-Case Analysis completed. Check the Cross-Case Intelligence Dashboard.');
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            Investigation Case Files
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {cases.length} ACTIVE LAW ENFORCEMENT DOSSIERS
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Filter Cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.8rem' }}
            />
          </div>

          <select
            className="input-field"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ width: '220px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
          >
            <option value="ALL">All Cases</option>
            <option value="CONVICTED">Convicted</option>
            <option value="CONVICTION CONFIRMED">Conviction Confirmed</option>
            <option value="ACQUITTED">Acquitted</option>
            <option value="APPEAL PENDING">Appeal Pending</option>
            <option value="ACTIVE">Investigation / Trial Status</option>
          </select>

          <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setIsNewCaseModalOpen(true)}>
            <Plus size={16} /> Open New Case
          </button>
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FolderKanban size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>No investigation cases available</h3>
          <p>Upload and verify a case document to create a case.</p>
        </div>
      ) : (
        <>
          {filteredCases.some(c => c.isPublicRecord) && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginTop: '16px' }}>
                Publicly Documented Criminal Cases
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {filteredCases.filter(c => c.isPublicRecord).map((c) => (
                  <div
                    key={c.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      border: selectedCase?.id === c.id ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                      boxShadow: selectedCase?.id === c.id ? '0 0 15px var(--accent-cyan-glow)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => onSelectCase(c)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {c.isPublicRecord ? 'PUBLIC CASE • ' : ''}{c.caseNumber}
                        </span>
                        <span className={c.status === 'CONVICTED' || c.status === 'CONVICTION CONFIRMED' ? 'badge badge-critical' : c.status === 'ACQUITTED' ? 'badge badge-medium' : 'badge badge-high'}>
                          {c.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.3 }}>
                        {c.title}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                        {c.isPublicRecord ? (
                          <>Location: <strong>{c.district}</strong></>
                        ) : (
                          <>Target Syndicate: <strong>{c.syndicate}</strong></>
                        )}
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                        {c.summary}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} style={{ color: 'var(--accent-blue)' }} />
                        <span>{c.leadOfficer}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                        <span>Inspect Dossier</span> <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filteredCases.some(c => !c.isPublicRecord) && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginTop: '32px' }}>
                Investigation Cases
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {filteredCases.filter(c => !c.isPublicRecord).map((c) => (
                  <div
                    key={c.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      border: selectedCase?.id === c.id ? '1px solid var(--border-cyan)' : '1px solid var(--border-subtle)',
                      boxShadow: selectedCase?.id === c.id ? '0 0 15px var(--accent-cyan-glow)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => onSelectCase(c)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {c.caseNumber}
                        </span>
                        <span className={c.status === 'ACTIVE' ? 'badge badge-critical' : 'badge badge-high'}>
                          {c.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.3 }}>
                        {c.title}
                      </h3>

                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>
                        Target Syndicate: <strong>{c.syndicate}</strong>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                        {c.summary}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} style={{ color: 'var(--accent-blue)' }} />
                        <span>{c.leadOfficer}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                        <span>Inspect Dossier</span> <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: '32px', padding: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
        <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: 'var(--accent-cyan)' }} />
        Public Case Records — Information reproduced from publicly available judicial/government sources. CRIMENET analysis is for demonstration and does not constitute a finding of guilt.
      </div>

      {/* Case Details Modal Drawer */}
      {selectedCase && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 95,
            background: 'rgba(5, 8, 17, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => onSelectCase(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '600px',
              height: '100vh',
              borderRadius: 0,
              borderLeft: '1px solid var(--border-cyan)',
              background: '#0a0f1d',
              padding: '32px',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '8px' }}>
                  {selectedCase.caseNumber}
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  {selectedCase.title}
                </h2>
              </div>
              <button
                onClick={() => onSelectCase(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Meta Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'rgba(15,23,42,0.8)', borderRadius: '10px', marginBottom: '24px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>{' '}
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{selectedCase.status}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Severity:</span>{' '}
                <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{selectedCase.severity}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Lead Officer:</span>{' '}
                <span style={{ color: '#ffffff' }}>{selectedCase.leadOfficer}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date Opened:</span>{' '}
                <span style={{ color: '#ffffff' }}>{selectedCase.dateOpened}</span>
              </div>
            </div>

            {/* Executive Case Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                {selectedCase.isPublicRecord ? 'CASE OVERVIEW' : 'Executive Investigation Brief'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedCase.summary}
              </p>
            </div>

            {selectedCase.isPublicRecord && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                    <FileText size={18} style={{ color: 'var(--accent-cyan)', display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                    Case Details
                  </h3>
                  <div style={{ background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <div><span style={{color:'var(--text-muted)'}}>FIR / Crime No:</span> <span style={{color:'#fff'}}>{selectedCase.firNumber}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>Police Station:</span> <span style={{color:'#fff'}}>{selectedCase.policeStation}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>District:</span> <span style={{color:'#fff'}}>{selectedCase.district}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>Incident Date:</span> <span style={{color:'#fff'}}>{selectedCase.incidentDate}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>FIR Date:</span> <span style={{color:'#fff'}}>{selectedCase.firDate}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>Offences:</span> <span style={{color:'#fff'}}>{selectedCase.offences?.join(', ')}</span></div>
                  </div>
                </div>

                {selectedCase.investigationTimeline && selectedCase.investigationTimeline.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                      INVESTIGATION TIMELINE
                    </h3>
                    <div style={{ paddingLeft: '8px', borderLeft: '2px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedCase.investigationTimeline.map((item, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '-13px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{item.step}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCase.evidenceCategories && selectedCase.evidenceCategories.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                      EVIDENCE
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedCase.evidenceCategories.map((ev, i) => (
                        <span key={i} className="badge badge-medium">{ev}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                    COURT OUTCOME
                  </h3>
                  <div style={{ background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    <div><span style={{color:'var(--text-muted)'}}>Trial Court:</span> <span style={{color:'#fff', fontWeight:600}}>{selectedCase.trialOutcome}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>Appeal:</span> <span style={{color:'#fff'}}>{selectedCase.appealOutcome}</span></div>
                    <div><span style={{color:'var(--text-muted)'}}>Final Status:</span> <span style={{color:'var(--accent-red)', fontWeight:700}}>{selectedCase.finalStatus}</span></div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'var(--font-mono)' }}>
                  SOURCE: Public judicial record — <span style={{ color: 'var(--accent-cyan)' }}>{selectedCase.sourceReference}</span>
                </div>
              </>
            )}

            {/* Uploaded Case Document (if any) */}
            {(caseDocuments[selectedCase.id] || selectedCase.evidenceCount > 0) && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HardDrive size={18} style={{ color: 'var(--accent-cyan)' }} /> Case Documents
                </h3>
                {caseDocuments[selectedCase.id] ? (
                  <div style={{
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <FileText size={24} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{caseDocuments[selectedCase.id].name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {caseDocuments[selectedCase.id].type.split('/')[1]?.toUpperCase() || 'DOCUMENT'} • UPLOADED
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>View Document</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Standard evidence files attached. See Intelligence Routing for details.
                  </div>
                )}
              </div>
            )}

            {/* Linked Suspects */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--accent-cyan)' }} /> Primary Suspects
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {suspects.filter((s) => selectedCase.suspectIds.includes(s.id)).map((suspect) => {
                  let resolved = suspect.name || suspect.displayName || suspect.fullName;
                  if (!resolved || resolved.toLowerCase() === 'redacted') {
                    resolved = "Name Redacted";
                  }
                  return (
                  <div
                    key={suspect.id}
                    onClick={() => {
                      onSelectCase(null);
                      onNavigate('suspects', { suspect });
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>
                        {resolved} ({suspect.alias})
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Role: {suspect.role}
                      </div>
                    </div>
                    <span className={suspect.threatLevel === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-high'}>
                      Threat {suspect.riskScore}%
                    </span>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* AI & Network Connections */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} style={{ color: 'var(--accent-emerald)' }} /> Intelligence Routing
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                 <button 
                   onClick={() => {
                     onSelectCase(null);
                     onNavigate('network', { nodeId: selectedCase.suspectIds[0] });
                   }}
                   className="btn btn-secondary" 
                   style={{ fontSize: '0.8rem', padding: '12px' }}
                 >
                   View Connected Network Grid
                 </button>
                 <button 
                   onClick={() => {
                     onSelectCase(null);
                     onNavigate('evidence');
                   }}
                   className="btn btn-secondary" 
                   style={{ fontSize: '0.8rem', padding: '12px' }}
                 >
                   View {selectedCase.evidenceCount} Evidence Files
                 </button>
                 <button 
                   onClick={() => {
                     onSelectCase(null);
                     onNavigate('map', { location: selectedCase.location });
                   }}
                   className="btn btn-secondary" 
                   style={{ fontSize: '0.8rem', padding: '12px' }}
                 >
                   Map Associated Hotspots
                 </button>
                 <button 
                   onClick={() => {
                     onSelectCase(null);
                     onNavigate('ai');
                   }}
                   className="btn btn-primary" 
                   style={{ fontSize: '0.8rem', padding: '12px' }}
                 >
                   Generate Intelligence Summary
                 </button>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => onSelectCase(null)} style={{ flex: 1 }}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
      {/* New Case Modal */}
      
      {deleteModalOpen && caseToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '500px', border: '1px solid var(--accent-red)', boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Case?</h2>
              {!isDeleting && <button className="icon-btn" onClick={() => setDeleteModalOpen(false)}><X size={20} /></button>}
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                This action will permanently remove this case and its case-specific investigation data. Cross-case links associated with this case will also be removed.
              </p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '5px' }}>
                  {caseToDelete.isPublicRecord ? 'PUBLIC CASE • ' : ''}{caseToDelete.caseNumber}
                </div>
                <div style={{ fontWeight: 'bold' }}>{caseToDelete.title}</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Type <strong style={{ color: 'var(--accent-red)' }}>DELETE</strong> to confirm
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ width: '100%', borderColor: deleteConfirmationText === 'DELETE' ? 'var(--accent-red)' : '' }}
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                  disabled={isDeleting}
                />
              </div>

              {deleteError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '15px', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px' }}>
                  {deleteError}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    background: deleteConfirmationText === 'DELETE' && !isDeleting ? 'var(--accent-red)' : 'var(--bg-dark)', 
                    color: deleteConfirmationText === 'DELETE' && !isDeleting ? 'white' : 'var(--text-muted)',
                    borderColor: deleteConfirmationText === 'DELETE' && !isDeleting ? 'var(--accent-red)' : 'var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={executeDelete}
                  disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                >
                  {isDeleting ? <Loader2 size={16} className="radar-spinner" /> : null}
                  {isDeleting ? 'Deleting...' : 'Delete Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNewCaseModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 95,
            background: 'rgba(5, 8, 17, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsNewCaseModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '32px',
              background: '#0a0f1d',
              border: '1px solid var(--border-cyan)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>Open New Case</h2>
              <button onClick={() => setIsNewCaseModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Case Title</label>
                <input type="text" className="input-field" placeholder="Operation Title..." style={{ width: '100%' }} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Primary Subject / Suspect Name</label>
                <input type="text" className="input-field" placeholder="Enter name" style={{ width: '100%' }} value={newSuspectName} onChange={(e) => setNewSuspectName(e.target.value)} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>FIR / Case Document</label>
                {!uploadedDocument ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--border-subtle)',
                      background: isDragging ? 'rgba(6, 182, 212, 0.05)' : 'rgba(15, 23, 42, 0.4)',
                      borderRadius: '8px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isDragging ? '0 0 15px var(--accent-cyan-glow)' : 'none'
                    }}
                  >
                    <UploadCloud size={24} style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '4px', fontWeight: 600 }}>Upload FIR / Case Document</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag & drop or click to browse</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>Supported: PDF, DOC, DOCX, TXT • Max: 10 MB</div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid var(--border-cyan)',
                    background: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <FileIcon size={24} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{uploadedDocument.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {(uploadedDocument.size / (1024 * 1024)).toFixed(2)} MB • {uploadedDocument.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => fileInputRef.current?.click()}>Replace</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--accent-red)' }} onClick={() => { setUploadedDocument(null); setUploadError(''); }}>×</button>
                    </div>
                    {/* Hidden input to allow replacing */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}
                {uploadError && <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{uploadError}</div>}
                
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontStyle: 'italic', display: 'flex', gap: '6px', alignItems: 'flex-start', marginTop: '8px' }}>
                  <Shield size={12} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginTop: '2px' }} />
                  <span>Upload only authorized case documents. Do not upload unnecessary personal or sensitive information.</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Target Syndicate</label>
                  <input type="text" className="input-field" placeholder="e.g. Veritas Apex" style={{ width: '100%' }} value={newSyndicate} onChange={(e) => setNewSyndicate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Severity</label>
                  <select className="input-field" style={{ width: '100%' }} value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)}>
                    <option>CRITICAL</option>
                    <option>HIGH</option>
                    <option>MEDIUM</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Executive Summary</label>
                <textarea className="input-field" rows={4} placeholder="Initial briefing..." style={{ width: '100%', resize: 'none' }} value={newSummary} onChange={(e) => setNewSummary(e.target.value)}></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsNewCaseModalOpen(false)}>Cancel</button>
              {uploadedDocument ? (
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} 
                  onClick={handleExtractData} 
                  disabled={isExtracting}
                >
                  {isExtracting ? <Loader2 size={16} className="radar-spinner" /> : <CheckCircle2 size={16} />}
                  {isExtracting ? 'OCR & Processing Pipeline...' : 'Extract & Analyze Document'}
                </button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreateCase} disabled={!newTitle}>Open Case</button>
              )}
            </div>
          </div>
        </div>
      )}

      {extractedData && (
        <CaseVerificationModal
          extractedData={extractedData}
          onConfirm={handleConfirmVerifiedData}
          onCancel={() => setExtractedData(null)}
        />
      )}
    </div>
  );
};
