/* OneCurve — Google Sheet stock sync (single source of truth).
 *
 * The "Stock" tab is published to the web as CSV
 * (Google Sheet → File → Share → Publish to web → choose Stock sheet → CSV).
 * Paste that URL into the <meta name="sheet-csv"> tag in index.html / rep.html
 * (or here as SHEET_CSV_URL_FALLBACK).
 *
 * Columns expected (header row, any order):
 *   id | name | stock | price | active
 *
 * The storefront calls fetchStock() on load and overrides stock/price/active
 * from products.json. If the fetch fails or no URL is set, it returns null and
 * the site silently keeps the products.json values (per CLAUDE.md).
 */
const SHEET_CSV_URL_FALLBACK = ''; // optional hardcode; meta tag takes priority

function sheetCsvUrl() {
  const m = document.querySelector('meta[name="sheet-csv"]');
  const v = m && m.content ? m.content.trim() : '';
  return v || SHEET_CSV_URL_FALLBACK;
}

/* Minimal, dependency-free CSV parser (handles quoted fields + commas). */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/* Returns a map: id -> { stock, price, active } or null on failure. */
async function fetchStock() {
  const url = sheetCsvUrl();
  if (!url) return null;
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return null;
    const rows = parseCSV(await r.text()).filter(r => r.length && r.some(c => c !== ''));
    if (rows.length < 2) return null;
    const head = rows[0].map(h => h.trim().toLowerCase());
    const ci = {
      id: head.indexOf('id'),
      stock: head.indexOf('stock'),
      price: head.indexOf('price'),
      active: head.indexOf('active'),
    };
    if (ci.id === -1) return null;
    const map = {};
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      const id = parseInt((cells[ci.id] || '').trim(), 10);
      if (!Number.isInteger(id)) continue;
      const entry = {};
      if (ci.stock !== -1 && cells[ci.stock] !== '') entry.stock = parseInt(cells[ci.stock], 10);
      if (ci.price !== -1 && cells[ci.price] !== '') entry.price = parseInt(cells[ci.price], 10);
      if (ci.active !== -1) {
        const a = (cells[ci.active] || '').trim().toLowerCase();
        entry.active = !(a === 'false' || a === 'no' || a === '0' || a === 'n');
      }
      map[id] = entry;
    }
    return map;
  } catch (e) {
    console.warn('sheet-sync: stock fetch failed, using products.json values', e);
    return null;
  }
}

// Expose for the storefront + rep console.
window.OneCurveStock = { fetchStock, sheetCsvUrl };
