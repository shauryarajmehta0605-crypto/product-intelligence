# Product Intelligence

**UniHack 2026 Demo** — AI-Powered Product Intelligence for Industrial Commerce

Transforms raw catalogue data (CSV with 6 standard columns) into structured, commerce-ready product data with 7 target output fields, explainable AI, and ground truth validation against client-verified examples.

---

## Problem

Industrial distributors receive product catalogues in inconsistent formats. Manual structuring is slow, error-prone, and doesn't scale. This app implements a real client specification for automated extraction.

---

## Solution

Product Intelligence takes raw catalogue data (Mfg_Part_Num, Part_Desc, E1_Brand, Unilog_Brand, DIB_Brand, Part_Manuf) and transforms it into 7 structured output fields with confidence scores, AI reasoning, and validation against known-correct ground truth examples.

---

## Features

### Core Flow

1. **Upload/Input** — Two modes:
   - **CSV Upload**: Drag & drop or browse `.csv` file with 6 required columns
   - **Paste Rows**: Tab or comma-separated rows, one product per line
   - **Load Sample Data**: 5 built-in products in the real format
   - Empty brand markers (`-- Unbranded --`, `-- No Unilog Brand --`, `-- No DIB Brand --`) are auto-filtered

2. **Processing Pipeline** — Animated 5-stage visible pipeline:
   - Extracting fields
   - Validating data
   - Enriching missing fields
   - Standardizing units
   - Calculating confidence

3. **Structured Results Table** — One row per product with all 7 output fields:
   - Mfg Part #, Part Description, Manufacturer, Brand, Classpath, Short Desc, Invoice Desc (40-char), Attributes, Confidence
   - Yellow highlight on AI-enriched fields
   - ⚠ badge on Invoice Desc exceeding 40-char limit
   - Sortable, filterable by Classpath, searchable

4. **Product Detail View** — Side-by-side raw input vs structured output:
   - Full raw input preservation
   - AI explanations tab with reasoning traces + confidence per field

5. **Catalog Dashboard** — Aggregate metrics + **Ground Truth Validation**:
   - Total products, average confidence, AI fill rate
   - Confidence distribution, Classpath & Brand breakdowns
   - **Ground Truth Validation**: AI output vs 2 client-verified examples with Match/Partial/Miss badges

6. **Export** — Download cleaned data as JSON or CSV (7 output fields + input columns)

---

## Input Format (Real Client Spec)

**6 Required Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| `Mfg_Part_Num` | Manufacturer part number | `DCB518ASTS06G` |
| `Part_Desc` | Full product description | `DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc` |
| `E1_Brand` | E1 brand (or empty marker) | `-- Unbranded --` |
| `Unilog_Brand` | Unilog brand (or empty marker) | `-- No Unilog Brand --` |
| `DIB_Brand` | DIB brand (or empty marker) | `-- No DIB Brand --` |
| `Part_Manuf` | Manufacturer with code | `Freud Inc (2435)` |

**Empty Brand Markers (auto-filtered):**
- `-- Unbranded --`
- `-- No Unilog Brand --`
- `-- No DIB Brand --`

---

## Output Fields (7 Target Fields)

| Field | Description | Example |
|-------|-------------|---------|
| **MANUFACTURER_NAME** | Cleaned manufacturer (code stripped) | `Freud Inc` |
| **BRAND_NAME** | Derived from brand fields or description; falls back to Manufacturer | `Diablo` |
| **CLASSPATH** | Best-guess category path from keywords | `Abrasives > Sanding Belts` |
| **SHORT_DESC** | Human-readable title: Brand + attributes + type | `Diablo DCB518ASTS06G 1/2 in x 18 in Sanding Belt 6pc` |
| **INVOICE_DESC** | ALL CAPS, abbreviated, **max 40 chars** | `DIABLO 1/2INX18IN SAND BLT 6PC` |
| **ATTRIBUTES** | Up to 3 label/value pairs from description | `Size: 1/2 in x 18 in, Pack Qty: 6` |
| **CONFIDENCE + REASONING** | Per-field confidence (0-100%) + AI reasoning note | `95% - "Extracted from Part_Manuf..."` |

---

## Ground Truth Validation (Client-Verified)

Two built-in test cases from client's own worked examples:

| Test Case | Mfg_Part_Num | Expected Brand | Expected Classpath |
|-----------|--------------|----------------|-------------------|
| 1 | `PDSH4816AF` | `FRIGIDAIRE®` | `Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers` |
| 2 | `WDTS7024RZ` | `Whirlpool®` | `Appliances & Consumer Electronics>Kitchen Appliances>Built-In Dishwashers` |

Dashboard shows side-by-side comparison with **Match / Partial / Miss** badges per field.

---

## Category Coverage (Keyword-Based)

| Classpath | Trigger Keywords / Brands |
|-----------|---------------------------|
| `Building Materials > Decking & Railing` | decking, deck, railing, rail kit, baluster, fascia, post sleeve, post wrap \| TREX, TIMBERTECH, AZEK |
| `Building Materials > Siding & Trim` | siding, hardie, smartside, soffit, trim |
| `Lighting > Fixtures` | wall lt, ceiling lt, pendant, chandelier, downlight \| KICHLER, SATCO, PHILIPS (lighting context) |
| `Power Tools` | drill, impact, grinder, saw, sander, nailer, driver \| DEWALT, MILWAUKEE, MAKITA, BOSCH (with tool keywords) |
| `Electrical > Wiring & Devices` | outlet, switch, wire, cable, GFCI, wallplate \| SOUTHWIRE, LEVITON |
| `Abrasives > Sanding Belts` | sanding belt, sandpaper, grinding wheel, flap disc, abrasive |
| `Cutting Tools > Saw Blades` | cutting blade, saw blade, circular saw, carbide |
| `Appliances > Kitchen Appliances > Built-In Dishwashers` | dishwasher |
| `General > Unclassified` | fallback |

---

## Tech Stack

- **Frontend**: React 19 (functional components, hooks)
- **Build**: Vite 8
- **Styling**: Custom CSS with design tokens (Inter + JetBrains Mono)
- **AI Processing**: Client-side rule-based extraction (no external API)
- **CSV Parsing**: Custom parser with quoted-field support

---

## Sample Data (Built-in)

5 products in the real 6-column format:
1. `DCB518ASTS06G` — Diablo Sanding Belt (Freud Inc)
2. `PDSH4816AF` — Dishwasher (Rheem Manufacturing) — **Ground Truth Case 1**
3. `WDTS7024RZ` — Dishwasher (Whirlpool Corporation) — **Ground Truth Case 2**
4. `DW872` — DeWalt Carbide Cutting Blade
5. `42328` — Bosch 18V Drill Driver

---

## Quick Start

```bash
# Install dependencies
cd product-intelligence-master
npm install

# Development server
npm run dev
# → http://localhost:5173

# Production build
npm run build
# → dist/ folder
```

---

## Usage

1. **CSV Upload**: Click "CSV Upload" tab → drag & drop `.csv` file → "Process N Products with AI"
2. **Paste Rows**: Click "Paste Rows" tab → paste tab/comma-separated data → "Process with AI"
3. **Sample Data**: Click "Load Sample Data (5 products)" → auto-processes
4. **Results**: Click any row for Detail view
5. **Dashboard**: Click "View Dashboard" → scroll to "Ground Truth Validation"
6. **Export**: "Export JSON" or "Export CSV" from Results page

---

## Project Structure

```
product-intelligence-master/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Navigation tabs
│   │   ├── UploadPage.jsx          # Input: CSV upload / paste rows / sample data
│   │   ├── ProcessingView.jsx      # Animated pipeline visualization
│   │   ├── ResultsTable.jsx        # Structured table (7 output fields)
│   │   ├── ProductDetailView.jsx   # Side-by-side comparison + AI explanations
│   │   └── CatalogDashboard.jsx    # Aggregate metrics + Ground Truth Validation
│   ├── utils/
│   │   └── aiProcessor.js          # Extraction, categorization, validation logic
│   ├── App.jsx                     # Main app state, CSV parsing, routing
│   ├── App.css                     # Design system & components
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles & CSS variables
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## AI Processing Logic (src/utils/aiProcessor.js)

### Core Functions

- `inferClasspath(partDesc)` — Keyword/brand-based classification (12+ categories)
- `extractBrandFromDescription(partDesc, partManuf)` — Safe brands (substring) + ambiguous brands (word boundary: GE, LG)
- `cleanManufacturerName(partManuf)` — Strips `(code)` suffix
- `buildShortDesc(brand, partDesc, mfgPartNum)` — Composes human-readable title
- `buildInvoiceDesc(shortDesc)` — ALL CAPS, abbreviations, 40-char limit
- `extractAttributes(partDesc, mfgPartNum)` — Up to 3: Size, Pack Qty, Voltage, Teeth, Material, Mounting
- `generateAiNotes(field, value, input, confidence)` — Reasoning trace per field
- `validateAgainstGroundTruth(generated, expected)` — Match/Partial/Miss with Levenshtein similarity

### Explainability

Every output field includes:
- `confidence` (0-100%)
- `reasoning` (human-readable trace)
- Available in Detail View → "AI Explanations" tab

---

## Design System (CSS Variables)

```css
:root {
  --primary: #1a3c5e;        /* Deep navy */
  --secondary: #007b83;      /* Teal */
  --accent: #e8a838;         /* Gold */
  --success: #2e7d32;        /* Green */
  --warning: #ed6c02;        /* Amber */
  --error: #c62828;          /* Red */
  --bg-primary: #f8fafc;     /* Page background */
  --bg-secondary: #ffffff;   /* Card background */
  --text-primary: #1e293b;   /* Primary text */
  --radius-lg: 12px;         /* Card radius */
  --shadow-md: ...           /* Elevation */
  --font-sans: 'Inter', ...  /* UI font */
  --font-mono: 'JetBrains Mono', ... /* Code font */
}
```

---

## Key Fixes / Improvements

| Issue | Fix |
|-------|-----|
| CSV upload splitting JSON lines | Separate CSV path (`csvData`) from raw text path (`rawInput`); proper CSV line parser with quoted-field support |
| "GE" false positive in brand detection | Ambiguous brands (GE, LG) now require word boundaries (`\bGE\b`); safe brands use substring match |
| 93% "General > Unclassified" | Added 5 high-volume categories: Decking & Railing, Siding & Trim, Lighting > Fixtures, Power Tools, Electrical > Wiring & Devices |
| No validation proof | Ground Truth Validation section with 2 client-verified examples + Match/Partial/Miss badges |

---

## Judging Criteria Alignment

| Criteria | Implementation |
|----------|----------------|
| **Structured Data Generation** | 7 target output fields + confidence + reasoning |
| **Accuracy/Consistency** | Keyword/brand classification, unit abbreviations, empty-brand filtering |
| **AI Validation & Enrichment** | 5-stage pipeline, per-field confidence, reasoning traces |
| **Scalability** | Dashboard metrics, batch processing simulation |
| **Client Spec Compliance** | Exact 6-column input, 7-field output, 40-char invoice limit, ground truth validation |

---

## License

UniHack 2026 Demo — Educational/Prototype Use Only