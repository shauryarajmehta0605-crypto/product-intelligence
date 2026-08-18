import { useState, useCallback, useEffect } from 'react';
import UploadPage from './components/UploadPage';
import ProcessingView from './components/ProcessingView';
import ResultsTable from './components/ResultsTable';
import ProductDetailView from './components/ProductDetailView';
import CatalogDashboard from './components/CatalogDashboard';
import Header from './components/Header';
import { processProducts, SAMPLE_CSV_DATA, GROUND_TRUTH_EXAMPLES } from './utils/aiProcessor';
import './App.css';

const VIEWS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  RESULTS: 'results',
  DETAIL: 'detail',
  DASHBOARD: 'dashboard'
};

function App() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [rawInput, setRawInput] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [processingStage, setProcessingStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvError, setCsvError] = useState(null);

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  // Proper CSV line parser - handles quoted fields with embedded commas
  const parseCsvLine = (line, delimiter = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field delimiter
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Push last field
    result.push(current.trim());
    return result;
  };

  const handleStartProcessing = useCallback(async (inputData) => {
    setIsProcessing(true);
    setView(VIEWS.PROCESSING);
    setProcessingStage(0);
    setProducts([]);
    
    const stages = [
      { name: 'Extracting fields', duration: 1500 },
      { name: 'Validating data', duration: 1200 },
      { name: 'Enriching missing fields', duration: 1800 },
      { name: 'Standardizing units', duration: 1000 },
      { name: 'Calculating confidence', duration: 800 }
    ];

    for (let i = 0; i < stages.length; i++) {
      setProcessingStage(i);
      await new Promise(resolve => setTimeout(resolve, stages[i].duration));
    }

    const processed = await processProducts(inputData);
    setProducts(processed);
    setIsProcessing(false);
    setView(VIEWS.RESULTS);
  }, []);

  const handleFileUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        
        if (lines.length < 2) {
          setCsvError('CSV must have at least a header row and one data row');
          return;
        }
        
        // Parse header
        const headerLine = lines[0];
        const isTabDelimited = headerLine.includes('\t');
        const delimiter = isTabDelimited ? '\t' : ',';
        
        const headers = headerLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
        
        // Validate required columns
        const requiredColumns = ['Mfg_Part_Num', 'Part_Desc', 'E1_Brand', 'Unilog_Brand', 'DIB_Brand', 'Part_Manuf'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setCsvError(`Missing required columns: ${missingColumns.join(', ')}. Found: ${headers.join(', ')}`);
          return;
        }
        
        // Parse data rows - PROPER CSV PARSING (handles quoted fields with commas)
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const values = parseCsvLine(line, delimiter);
          const obj = {};
          headers.forEach((h, idx) => obj[h] = values[idx] || '');
          
          // Ensure all required fields exist
          requiredColumns.forEach(col => {
            if (!(col in obj)) obj[col] = '';
          });
          
          data.push(obj);
        }
        
        setCsvData(data);
        setCsvError(null);
        // DO NOT setRawInput here - CSV path is separate from raw text path
      } catch (err) {
        console.error('CSV parse error:', err);
        setCsvError('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleSampleData = useCallback(() => {
    setRawInput('');
    setCsvData(SAMPLE_CSV_DATA);
    setCsvError(null);
    handleStartProcessing(SAMPLE_CSV_DATA);
  }, [handleStartProcessing]);

  const parsePastedText = useCallback((text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    
    // Detect delimiter from first line
    const firstLine = lines[0];
    const isTabDelimited = firstLine.includes('\t') && !firstLine.includes(',');
    const delimiter = isTabDelimited ? '\t' : ',';
    
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    
    // Check if first line is header or data
    const hasRequiredHeaders = ['Mfg_Part_Num', 'Part_Desc', 'E1_Brand', 'Unilog_Brand', 'DIB_Brand', 'Part_Manuf']
      .every(col => headers.includes(col));
    
    const startIndex = hasRequiredHeaders ? 1 : 0;
    const dataHeaders = hasRequiredHeaders ? headers : 
      ['Mfg_Part_Num', 'Part_Desc', 'E1_Brand', 'Unilog_Brand', 'DIB_Brand', 'Part_Manuf'];
    
    return lines.slice(startIndex).map(line => {
      const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      dataHeaders.forEach((h, i) => obj[h] = values[i] || '');
      return obj;
    });
  }, []);

  const handleProcess = useCallback(() => {
    // CSV upload path - use csvData directly (already parsed)
    if (csvData && csvData.length > 0) {
      handleStartProcessing(csvData);
      return;
    }
    
    // Raw text paste path - parse first
    if (rawInput.trim()) {
      const products = parsePastedText(rawInput);
      if (products.length > 0) {
        handleStartProcessing(products);
      }
      return;
    }
  }, [csvData, rawInput, handleStartProcessing, parsePastedText]);

  const handleRowClick = useCallback((product) => {
    setSelectedProduct(product);
    setView(VIEWS.DETAIL);
  }, []);

  const handleBackToResults = useCallback(() => {
    setSelectedProduct(null);
    setView(VIEWS.RESULTS);
  }, []);

  const handleViewDashboard = useCallback(() => {
    setView(VIEWS.DASHBOARD);
  }, []);

  const handleExport = useCallback((format) => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-intelligence-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        'Mfg_Part_Num', 'Part_Desc', 
        'MANUFACTURER_NAME', 'BRAND_NAME', 'CLASSPATH', 
        'SHORT_DESC', 'INVOICE_DESC', 'ATTRIBUTES',
        'confidence_score'
      ];
      const rows = products.map(p => [
        p.Mfg_Part_Num,
        p.Part_Desc,
        p.MANUFACTURER_NAME,
        p.BRAND_NAME,
        p.CLASSPATH,
        p.SHORT_DESC,
        p.INVOICE_DESC,
        JSON.stringify(p.ATTRIBUTES),
        p.confidence_score
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-intelligence-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [products]);

  const renderView = () => {
    switch (view) {
      case VIEWS.UPLOAD:
        return (
          <UploadPage
            rawInput={rawInput}
            setRawInput={setRawInput}
            csvData={csvData}
            onFileUpload={handleFileUpload}
            onSampleData={handleSampleData}
            onProcessRawText={handleProcess}
          />
        );
      case VIEWS.PROCESSING:
        return (
          <ProcessingView
            stage={processingStage}
            productCount={csvData?.length || (rawInput.trim() ? 1 : 0)}
          />
        );
      case VIEWS.RESULTS:
        return (
          <ResultsTable
            products={products}
            onRowClick={handleRowClick}
            onViewDashboard={handleViewDashboard}
            onExport={handleExport}
          />
        );
      case VIEWS.DETAIL:
        return (
          <ProductDetailView
            product={selectedProduct}
            onBack={handleBackToResults}
          />
        );
      case VIEWS.DASHBOARD:
        return (
          <CatalogDashboard
            products={products}
            onBack={handleBackToResults}
            groundTruthExamples={GROUND_TRUTH_EXAMPLES}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header currentView={view} onViewChange={handleViewChange} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;