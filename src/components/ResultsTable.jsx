import { useState, useMemo } from 'react';

export default function ResultsTable({ products, onRowClick, onViewDashboard, onExport }) {
  const [sortConfig, setSortConfig] = useState({ key: 'confidence_score', direction: 'desc' });
  const [filterClasspath, setFilterClasspath] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const classpaths = useMemo(() => {
    const cats = new Set(products.map(p => p.CLASSPATH));
    return Array.from(cats).sort();
  }, [products]);

  const sortedProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.Mfg_Part_Num.toLowerCase().includes(q) ||
        p.Part_Desc.toLowerCase().includes(q) ||
        p.MANUFACTURER_NAME.toLowerCase().includes(q) ||
        p.BRAND_NAME.toLowerCase().includes(q) ||
        p.CLASSPATH.toLowerCase().includes(q) ||
        p.SHORT_DESC.toLowerCase().includes(q)
      );
    }

    if (filterClasspath !== 'all') {
      result = result.filter(p => p.CLASSPATH === filterClasspath);
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, sortConfig, filterClasspath, searchQuery]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getConfidenceClass = (score) => {
    if (score >= 85) return 'high';
    if (score >= 65) return 'medium';
    return 'low';
  };

  const formatAttributes = (attrs) => {
    if (!attrs || attrs.length === 0) return '—';
    return attrs.map(a => `${a.label}: ${a.value}`).join(', ');
  };

  const formatInvoiceDesc = (desc, warning) => {
    const display = desc.length > 40 ? desc.substring(0, 40) + '…' : desc;
    return warning ? (
      <span className="invoice-desc-warning" title={warning}>
        {display}
        <span className="warning-badge">⚠</span>
      </span>
    ) : display;
  };

  return (
    <div className="results-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Structured Results</h1>
          <p className="page-subtitle">{products.length} products processed • Click a row for detailed comparison</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => onExport('json')}>
            <DownloadIcon /> Export JSON
          </button>
          <button className="btn btn-secondary" onClick={() => onExport('csv')}>
            <DownloadIcon /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={onViewDashboard}>
            <ChartIcon /> View Dashboard
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="table-toolbar">
            <div className="search-box">
              <SearchIcon />
              <input
                type="text"
                className="input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 280, paddingLeft: 36 }}
              />
            </div>
            <select
              className="input"
              value={filterClasspath}
              onChange={(e) => setFilterClasspath(e.target.value)}
              style={{ width: 280 }}
            >
              <option value="all">All Classpaths</option>
              {classpaths.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('Mfg_Part_Num')} style={{ cursor: 'pointer' }}>
                    Mfg Part # {sortConfig.key === 'Mfg_Part_Num' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Part Description</th>
                  <th onClick={() => handleSort('MANUFACTURER_NAME')} style={{ cursor: 'pointer' }}>
                    Manufacturer {sortConfig.key === 'MANUFACTURER_NAME' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('BRAND_NAME')} style={{ cursor: 'pointer' }}>
                    Brand {sortConfig.key === 'BRAND_NAME' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('CLASSPATH')} style={{ cursor: 'pointer' }}>
                    Classpath {sortConfig.key === 'CLASSPATH' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Short Description</th>
                  <th>Invoice Desc (40 char)</th>
                  <th>Attributes</th>
                  <th onClick={() => handleSort('confidence_score')} style={{ cursor: 'pointer' }}>
                    Confidence {sortConfig.key === 'confidence_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-state" style={{ padding: 48 }}>
                      No products match your filters
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product, index) => (
                    <tr
                      key={product.Mfg_Part_Num + index}
                      className="clickable"
                      onClick={() => onRowClick(product)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onRowClick(product)}
                    >
                      <td>
                        <div className="product-name-cell">
                          <strong>{product.Mfg_Part_Num}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="specs-preview" title={product.Part_Desc}>
                          {product.Part_Desc.length > 50 ? product.Part_Desc.substring(0, 50) + '…' : product.Part_Desc}
                        </div>
                      </td>
                      <td>
                        <span className={product.ai_notes.some(n => n.field === 'MANUFACTURER_NAME') ? 'highlight-ai' : ''}>
                          {product.MANUFACTURER_NAME}
                        </span>
                      </td>
                      <td>
                        <span className={product.ai_notes.some(n => n.field === 'BRAND_NAME') ? 'highlight-ai' : ''}>
                          {product.BRAND_NAME}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{product.CLASSPATH}</span>
                      </td>
                      <td>
                        <div className="specs-preview" title={product.SHORT_DESC}>
                          {product.SHORT_DESC.length > 60 ? product.SHORT_DESC.substring(0, 60) + '…' : product.SHORT_DESC}
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                          {formatInvoiceDesc(product.INVOICE_DESC, product.INVOICE_DESC_WARNING)}
                        </code>
                      </td>
                      <td>
                        <div className="specs-preview" title={formatAttributes(product.ATTRIBUTES)}>
                          {formatAttributes(product.ATTRIBUTES).length > 40 ? formatAttributes(product.ATTRIBUTES).substring(0, 40) + '…' : formatAttributes(product.ATTRIBUTES)}
                        </div>
                      </td>
                      <td>
                        <div className="confidence-cell">
                          <div className="confidence-bar">
                            <div className={'confidence-fill ' + getConfidenceClass(product.confidence_score)} style={{ width: product.confidence_score + '%' }} />
                          </div>
                          <span className="confidence-value">{product.confidence_score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-color legend-ai" />
          {'Yellow highlight = AI enriched/corrected field'}
        </span>
        <span className="legend-item">
          <span className="legend-color legend-warning" />
          {'⚠ Badge = Invoice description exceeds 40-char limit'}
        </span>
        <span className="legend-item">
          <span className="legend-color legend-success" />
          {'Green confidence = High (≥85%)'}
        </span>
        <span className="legend-item">
          <span className="legend-color legend-warning" />
          {'Amber confidence = Medium (65-84%)'}
        </span>
        <span className="legend-item">
          <span className="legend-color legend-error" />
          {'Red confidence = Low (<65%)'}
        </span>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}