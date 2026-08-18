import { useState, useRef, useCallback } from 'react';

const REQUIRED_COLUMNS = ['Mfg_Part_Num', 'Part_Desc', 'E1_Brand', 'Unilog_Brand', 'DIB_Brand', 'Part_Manuf'];

export default function UploadPage({
  rawInput,
  setRawInput,
  csvData,
  onFileUpload,
  onSampleData,
  onProcessRawText
}) {
  const [activeTab, setActiveTab] = useState('csv');
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [csvError, setCsvError] = useState(null);
  const [pasteError, setPasteError] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        onFileUpload(file);
        handleFilePreview(file);
      }
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv')) {
        onFileUpload(file);
        handleFilePreview(file);
      }
    }
  }, [onFileUpload]);

  const handleFilePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsText(file);
  };

  const handlePaste = useCallback((e) => {
    const text = e.clipboardData.getData('text');
    setRawInput(text);
    setPasteError(null);
    
    // Quick validation - check if it looks like tab/comma separated with 6 columns
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length > 0) {
      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const maxCols = Math.max(commaCount, tabCount) + 1;
      
      if (maxCols < 6) {
        setPasteError('Expected 6 columns (Mfg_Part_Num, Part_Desc, E1_Brand, Unilog_Brand, DIB_Brand, Part_Manuf). Detected ~' + maxCols + ' columns.');
      }
    }
  }, [setRawInput]);

  const canProcess = (activeTab === 'csv' || activeTab === 'paste') && (csvData !== null || rawInput.trim().length > 0);

  return (
    <div className="upload-page">
      <div className="page-header">
        <h1 className="page-title">Product Data Input</h1>
        <p className="page-subtitle">Upload CSV or paste tab/comma-separated rows with 6 required columns</p>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'csv'}
          className={`tab ${activeTab === 'csv' ? 'active' : ''}`}
          onClick={() => setActiveTab('csv')}
        >
          <CsvIcon /> CSV Upload
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'paste'}
          className={`tab ${activeTab === 'paste' ? 'active' : ''}`}
          onClick={() => setActiveTab('paste')}
        >
          <PasteIcon /> Paste Rows
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {activeTab === 'csv' ? (
          <div className="card-body">
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <UploadCloudIcon className="drop-zone-icon" />
              <h3 className="drop-zone-title">Drag & drop CSV file here</h3>
              <p className="drop-zone-subtitle">or click to browse</p>
              <p className="drop-zone-hint">
                Required columns: Mfg_Part_Num, Part_Desc, E1_Brand, Unilog_Brand, DIB_Brand, Part_Manuf
              </p>
              <p className="drop-zone-hint" style={{ color: 'var(--accent)', fontWeight: 500 }}>
                Note: "-- Unbranded --", "-- No Unilog Brand --", "-- No DIB Brand --" are treated as empty
              </p>
            </div>

            {csvError && (
              <div className="error-banner" style={{ marginTop: 16, padding: 12, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, color: '#c62828' }}>
                <strong>CSV Format Error:</strong> {csvError}
              </div>
            )}

            {filePreview && (
              <div className="file-preview">
                <div className="file-preview-header">
                  <span>Preview (first 500 chars)</span>
                  <span className="file-size">{csvData?.length || 0} products detected</span>
                </div>
                <pre className="code-block">{filePreview.slice(0, 500)}...</pre>
              </div>
            )}

            {csvData && (
              <div className="input-actions" style={{ marginTop: 16 }}>
                <button
                  className="btn btn-primary"
                  onClick={onProcessRawText}
                  disabled={!canProcess}
                >
                  <ProcessIcon /> Process {csvData.length} Products with AI
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card-body">
            <label className="input-label" htmlFor="paste-input">
              Paste Tab or Comma-Separated Rows (one product per line)
            </label>
            <textarea
              ref={textareaRef}
              id="paste-input"
              className="input textarea"
              value={rawInput}
              onChange={(e) => { setRawInput(e.target.value); setPasteError(null); }}
              onPaste={handlePaste}
              placeholder={`Mfg_Part_Num\tPart_Desc\tE1_Brand\tUnilog_Brand\tDIB_Brand\tPart_Manuf
DCB518ASTS06G\tDCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc\t-- Unbranded --\t-- No Unilog Brand --\t-- No DIB Brand --\tFreud Inc (2435)
PDSH4816AF\tPDSH4816AF Dishwasher SS - Display Only\t-- Unbranded --\t-- No Unilog Brand --\t-- No DIB Brand --\tRheem Manufacturing`}
              spellCheck={false}
              style={{ fontSize: 12 }}
            />
            {pasteError && (
              <div className="error-banner" style={{ marginTop: 8, padding: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#b45309', fontSize: 13 }}>
                <strong>⚠ Format Warning:</strong> {pasteError}
              </div>
            )}
            <div className="input-hint">
              <kbd>Ctrl+V</kbd> to paste &nbsp;|&nbsp; Tab or comma separated &nbsp;|&nbsp; 6 columns required &nbsp;|&nbsp; One product per line
            </div>
            <div className="input-actions">
              <button className="btn btn-secondary" onClick={onSampleData}>
                <SampleIcon /> Load Sample Data (5 products)
              </button>
              <button
                className="btn btn-primary"
                onClick={onProcessRawText}
                disabled={!canProcess}
              >
                <ProcessIcon /> Process with AI
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="features-grid">
        <FeatureCard
          icon={ExtractIcon}
          title="6-Column CSV Input"
          description="Accepts Mfg_Part_Num, Part_Desc, E1_Brand, Unilog_Brand, DIB_Brand, Part_Manuf"
        />
        <FeatureCard
          icon={ValidateIcon}
          title="Empty Brand Filtering"
          description="Automatically treats -- Unbranded --, -- No Unilog Brand --, -- No DIB Brand -- as empty"
        />
        <FeatureCard
          icon={StandardizeIcon}
          title="7 Target Output Fields"
          description="MANUFACTURER_NAME, BRAND_NAME, CLASSPATH, SHORT_DESC, INVOICE_DESC, ATTRIBUTES, Confidence"
        />
        <FeatureCard
          icon={ExplainIcon}
          title="Ground Truth Validation"
          description="Built-in client-validated test cases for demonstrable accuracy"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="card feature-card">
      <div className="card-body">
        <div className="feature-icon">
          <Icon />
        </div>
        <h4 className="feature-title">{title}</h4>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );
}

function CsvIcon() {
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

function PasteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function SampleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function ProcessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ExtractIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ValidateIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function StandardizeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function ExplainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}