import { useEffect, useState } from 'react';

const STAGES = [
  { id: 'extract', label: 'Extracting fields', description: 'Parsing raw text, identifying product attributes from descriptions and specs' },
  { id: 'validate', label: 'Validating data', description: 'Cross-referencing against industrial standards, checking ranges and formats' },
  { id: 'enrich', label: 'Enriching missing fields', description: 'Inferring missing specifications, materials, and categories from context' },
  { id: 'standardize', label: 'Standardizing units', description: 'Converting all measurements to SI units (bar, kg, mm, kW, °C)' },
  { id: 'confidence', label: 'Calculating confidence', description: 'Scoring each field based on source reliability and extraction certainty' }
];

export default function ProcessingView({ stage, productCount }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState(new Set());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targetStage = Math.min(stage, STAGES.length - 1);
    setCurrentStageIndex(targetStage);
    
    const newCompleted = new Set();
    for (let i = 0; i <= targetStage; i++) {
      newCompleted.add(i);
    }
    setCompletedStages(newCompleted);
    setProgress(((targetStage + 1) / STAGES.length) * 100);
  }, [stage]);

  return (
    <div className="processing-view">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">AI Processing Pipeline</h2>
          <div className="processing-status">
            <span className="badge badge-info">Processing {productCount} product{productCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: progress + '%' }} />
            </div>
            <div className="progress-labels">
              {STAGES.map((_, i) => (
                <span key={i} style={{ left: ((i / (STAGES.length - 1)) * 100) + '%' }}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          <div className="pipeline-steps" role="list" aria-label="Processing stages">
            {STAGES.map((stageData, index) => {
              const isActive = index === currentStageIndex && currentStageIndex < STAGES.length;
              const isCompleted = completedStages.has(index) && index < currentStageIndex;
              
              return (
                <div
                  key={stageData.id}
                  className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  role="listitem"
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="step-icon" aria-hidden="true">
                    {isCompleted ? (
                      <CheckIcon />
                    ) : isActive ? (
                      <Spinner size={16} />
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</span>
                    )}
                  </div>
                  <div className="step-content">
                    <div className="step-label">{stageData.label}</div>
                    <div className="step-description">{stageData.description}</div>
                  </div>
                  {isActive && (
                    <div className="step-animation" aria-hidden="true">
                      <div className="dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {currentStageIndex >= STAGES.length - 1 && (
            <div className="completion-message" role="status" aria-live="polite">
              <CompletionIcon />
              <h3>Processing Complete</h3>
              <p>All {productCount} product{productCount !== 1 ? 's' : ''} have been structured and validated</p>
            </div>
          )}
        </div>
      </div>

      <div className="processing-info">
        <h3>What's happening behind the scenes</h3>
        <div className="info-grid">
          <InfoItem
            icon={BrainIcon}
            title="LLM-Powered Extraction"
            description="Large language model parses unstructured industrial text, recognizing domain-specific terminology like 'WOG', 'IE3', 'PN16', '4-20mA'"
          />
          <InfoItem
            icon={ShieldIcon}
            title="Validation Rules Engine"
            description="100+ industrial validation rules: pressure ranges, material compatibility, efficiency classes, flange standards"
          />
          <InfoItem
            icon={GlobeIcon}
            title="Global Unit Standardization"
            description="Automatic conversion: psi→bar, lbs→kg, in→mm, HP→kW, °F→°C, GPM→L/min for worldwide consistency"
          />
          <InfoItem
            icon={LightbulbIcon}
            title="Explainable AI Output"
            description="Every enriched field includes reasoning trace and confidence score for regulatory compliance and audit trails"
          />
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Spinner({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  );
}

function CompletionIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 00-3 3v1a3 3 0 006 0V5a3 3 0 00-3-3z" />
      <path d="M19 14c1.5 0 2.5 2 2.5 3.5V19a2 2 0 01-2 2H6.5a2 2 0 01-2-2v-1.5c0-1.5 1-3.5 2.5-3.5" />
      <path d="M6 10h1" />
      <path d="M17 10h1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11c0-4.512-6-6-6-12v5c4.5 0 6 3 6 7v3" />
      <line x1="6" y1="19" x2="6.01" y2="19" />
      <line x1="10" y1="19" x2="10.01" y2="19" />
      <line x1="14" y1="19" x2="14.01" y2="19" />
      <line x1="18" y1="19" x2="18.01" y2="19" />
    </svg>
  );
}

function InfoItem({ icon: Icon, title, description }) {
  return (
    <div className="card info-card">
      <div className="card-body">
        <div className="info-icon">
          <Icon />
        </div>
        <h4 className="info-title">{title}</h4>
        <p className="info-description">{description}</p>
      </div>
    </div>
  );
}