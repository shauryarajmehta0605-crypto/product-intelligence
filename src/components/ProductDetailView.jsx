import { useState } from 'react';

export default function ProductDetailView({ product, onBack }) {
  const [activeTab, setActiveTab] = useState('comparison');

  const rawInput = product._rawInput || {};
  const structuredOutput = { ...product };
  delete structuredOutput._rawInput;
  delete structuredOutput.ai_notes;
  delete structuredOutput.confidence_score;

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2)
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'code-string';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) cls = 'code-key';
          else cls = 'code-string';
        } else if (/true|false/.test(match)) cls = 'code-boolean';
        else if (/null/.test(match)) cls = 'code-null';
        else if (/^-?\d/.test(match)) cls = 'code-number';
        return `<span class="${cls}">${match}</span>`;
      });
  };

  const getFieldNote = (field) => {
    const note = product.ai_notes?.find(n => n.field === field);
    return note ? note.reasoning : null;
  };

  const isAiEnriched = (field) => {
    return product.ai_notes?.some(n => n.field === field) || false;
  };

  const fieldConfigs = [
    { key: 'MANUFACTURER_NAME', label: 'Manufacturer Name', rawKey: 'Part_Manuf' },
    { key: 'BRAND_NAME', label: 'Brand Name', rawKey: 'E1_Brand' },
    { key: 'CLASSPATH', label: 'Classpath', rawKey: null },
    { key: 'SHORT_DESC', label: 'Short Description', rawKey: 'Part_Desc' },
    { key: 'INVOICE_DESC', label: 'Invoice Description (40 char max)', rawKey: null },
    { key: 'ATTRIBUTES', label: 'Attributes (up to 3)', rawKey: null }
  ];

  const getRawValue = (rawKey, rawInput) => {
    if (!rawKey) return null;
    const val = rawInput[rawKey];
    if (!val || val === '-- Unbranded --' || val === '-- No Unilog Brand --' || val === '-- No DIB Brand --') {
      return '(empty / filtered)';
    }
    return val;
  };

  const formatAttributeValue = (attrs) => {
    if (!attrs || attrs.length === 0) return '—';
    return attrs.map(a => `${a.label} = ${a.value}`).join('\n');
  };

  return (
    <div className="detail-page">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={onBack}>
          <BackIcon /> Back to Results
        </button>
        <div>
          <h1 className="page-title">{product.Mfg_Part_Num}</h1>
          <p className="page-subtitle">Classpath: {product.CLASSPATH} • Confidence: {product.confidence_score}%</p>
        </div>
      </div>

      <div className="tabs" role="tablist" style={{ marginBottom: 24 }}>
        <button
          role="tab"
          aria-selected={activeTab === 'comparison'}
          className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          <CompareIcon /> Side-by-Side Comparison
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'raw'}
          className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <CodeIcon /> Raw Input JSON
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'structured'}
          className={`tab ${activeTab === 'structured' ? 'active' : ''}`}
          onClick={() => setActiveTab('structured')}
        >
          <DatabaseIcon /> Structured Output JSON
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'explanations'}
          className={`tab ${activeTab === 'explanations' ? 'active' : ''}`}
          onClick={() => setActiveTab('explanations')}
        >
          <InfoIcon /> AI Explanations
        </button>
      </div>

      {activeTab === 'comparison' && (
        <div className="card">
          <div className="card-body">
            <div className="side-by-side">
              <div className="comparison-panel raw-panel">
                <h3 className="panel-title">
                  <RawIcon /> Raw Input
                </h3>
                <div className="comparison-fields">
                  {fieldConfigs.map(({ key, label, rawKey }) => {
                    const isEnriched = isAiEnriched(key);
                    let displayValue = getRawValue(rawKey, rawInput);
                    
                    if (key === 'BRAND_NAME') {
                      // Show all three brand fields
                      const e1 = rawInput.E1_Brand || '(empty)';
                      const unilog = rawInput.Unilog_Brand || '(empty)';
                      const dib = rawInput.DIB_Brand || '(empty)';
                      displayValue = `E1_Brand: ${e1}\nUnilog_Brand: ${unilog}\nDIB_Brand: ${dib}`;
                    } else if (key === 'CLASSPATH') {
                      displayValue = 'Not in source (AI inferred from Part_Desc)';
                    } else if (key === 'INVOICE_DESC') {
                      displayValue = 'Generated by AI (abbreviated from SHORT_DESC)';
                    } else if (key === 'ATTRIBUTES') {
                      displayValue = 'Extracted from Part_Desc by AI';
                    } else if (key === 'SHORT_DESC') {
                      displayValue = rawInput.Part_Desc || '—';
                    }
                    
                    return (
                      <div key={key} className={`comparison-field ${isEnriched ? 'ai-enriched' : ''}`}>
                        <label className="field-label">{label}</label>
                        <div className="field-value raw-value">
                          <pre>{displayValue}</pre>
                        </div>
                        {isEnriched && (
                          <div className="ai-badge-tooltip">
                            <span className="ai-badge">AI Enriched</span>
                            <div className="tooltip-content">
                              {getFieldNote(key)}
                              <div className="note-confidence">Confidence: {product.ai_notes.find(n => n.field === key)?.confidence}%</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div key="fullRawText" className="comparison-field">
                    <label className="field-label">Full Raw Input</label>
                    <div className="field-value raw-value">
                      <pre>{JSON.stringify(rawInput, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="comparison-panel structured-panel">
                <h3 className="panel-title">
                  <StructuredIcon /> Structured Output
                </h3>
                <div className="comparison-fields">
                  {fieldConfigs.map(({ key, label }) => {
                    const isEnriched = isAiEnriched(key);
                    let displayValue;
                    
                    if (key === 'ATTRIBUTES') {
                      displayValue = formatAttributeValue(product[key]);
                    } else if (key === 'INVOICE_DESC') {
                      displayValue = product[key] + (product.INVOICE_DESC_WARNING ? ' ⚠ EXCEEDS 40 CHAR LIMIT' : '');
                    } else {
                      displayValue = product[key] || '—';
                    }

                    return (
                      <div key={key} className={`comparison-field ${isEnriched ? 'ai-enriched' : ''}`}>
                        <label className="field-label">{label}</label>
                        <div className="field-value structured-value">
                          <pre>{displayValue}</pre>
                        </div>
                        {isEnriched && (
                          <div className="ai-badge-tooltip">
                            <span className="ai-badge">AI Enriched</span>
                            <div className="tooltip-content">
                              {getFieldNote(key)}
                              <div className="note-confidence">Confidence: {product.ai_notes.find(n => n.field === key)?.confidence}%</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'raw' && (
        <div className="card">
          <div className="card-body">
            <pre className="code-block">{formatJson(rawInput)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'structured' && (
        <div className="card">
          <div className="card-body">
            <pre className="code-block">{formatJson(structuredOutput)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'explanations' && (
        <div className="card">
          <div className="card-body">
            <h3 className="panel-title" style={{ marginBottom: 16 }}>
              <InfoIcon /> AI Decision Explanations
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Every AI-generated or corrected field includes a reasoning trace. This ensures auditability and trust in automated data processing.
            </p>
            {product.ai_notes && product.ai_notes.length > 0 ? (
              <div className="explanations-list">
                {product.ai_notes.map((note, index) => (
                  <div key={index} className="explanation-item">
                    <div className="explanation-header">
                      <span className="explanation-field">{note.field}</span>
                      <span className={`badge ${note.confidence >= 85 ? 'badge-success' : note.confidence >= 65 ? 'badge-warning' : 'badge-error'}`}>
                        {note.confidence}% confidence
                      </span>
                    </div>
                    <p className="explanation-text">{note.reasoning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>
                No AI enrichment notes available for this product
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="7" height="7" />
      <rect x="15" y="3" width="7" height="7" />
      <rect x="2" y="14" width="7" height="7" />
      <rect x="15" y="14" width="7" height="7" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function RawIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function StructuredIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}