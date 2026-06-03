/**
 * OneCurve Sports — Google Apps Script backend (single source of truth).
 *
 * Handles BOTH channels:
 *   - Online orders   (website → after verified Razorpay payment)
 *   - Offline sales   (rep.html Rep Console)
 * and keeps stock in one place, so the two can't oversell each other.
 *
 * ── SETUP ──────────────────────────────────────────────────────────────
 * 1. Create a Google Sheet with two tabs:
 *    Tab "Stock"  — header row:  id | name | stock | price | active
 *                   (one row per product; copy ids/names from products.json)
 *    Tab "Orders" — header row:  Timestamp | Order ID | Channel | Items |
 *                   Amount | Payment Mode | Rep | Customer | Phone | Status
 * 2. Extensions → Apps Script → paste this file. Set REP_PASSCODES + OWNER_EMAIL below.
 * 3. Deploy → New deployment → type "Web app" →
 *    Execute as: Me,  Who has access: Anyone → Deploy → copy the /exec URL.
 * 4. Paste that URL into <meta name="orders-endpoint"> in index.html AND rep.html.
 * 5. Publish the Stock tab to web as CSV (File → Share → Publish to web →
 *    select "Stock" → CSV) and paste that URL into <meta name="sheet-csv">.
 *
 * Re-deploy (Manage deployments → edit → new version) after any code change.
 */

// ── CONFIG ────────────────────────────────────────────────────────────────
var REP_PASSCODES = ['changeme123'];          // valid rep passcodes
var OWNER_EMAIL   = 'owner@example.com';       // low-stock + sale alerts
var LOW_STOCK_AT  = 3;                          // alert threshold

function doPost(e) {
  var out = { ok: false };
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.type === 'sale') {
      // Offline rep sale — validate passcode first.
      if (REP_PASSCODES.indexOf(String(data.passcode || '')) === -1) {
        return json({ ok: false, error: 'bad passcode' });
      }
      recordSale(data, 'OFFLINE');
      out.ok = true;
    } else if (data.type === 'order') {
      // Online order (already payment-verified server-side).
      recordSale(data, 'ONLINE');
      out.ok = true;
    }
  } catch (err) {
    out.error = String(err);
  }
  return json(out);
}

function recordSale(data, channel) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orders = ss.getSheetByName('Orders');
  var items = data.items || [];
  var itemsStr = items.map(function (i) { return i.name + ' x' + i.qty; }).join(', ');

  orders.appendRow([
    new Date(),
    data.order_id || ('OC-' + Date.now()),
    channel,
    itemsStr,
    data.amount || 0,
    data.payment_mode || '',
    data.rep || (channel === 'OFFLINE' ? 'rep' : ''),
    data.customer_name || '',
    data.customer_phone || '',
    'PAID'
  ]);

  // Decrement stock for each item; alert owner if any drops low.
  items.forEach(function (it) { decrementStock(it.id, it.qty, it.name); });
}

function decrementStock(id, qty, name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stock');
  var rng = sheet.getDataRange().getValues();
  var head = rng[0].map(function (h) { return String(h).toLowerCase().trim(); });
  var idCol = head.indexOf('id'), stockCol = head.indexOf('stock');
  if (idCol === -1 || stockCol === -1) return;
  for (var r = 1; r < rng.length; r++) {
    if (parseInt(rng[r][idCol], 10) === parseInt(id, 10)) {
      var cur = parseInt(rng[r][stockCol], 10) || 0;
      var next = cur - qty;                       // may go negative (backorder)
      sheet.getRange(r + 1, stockCol + 1).setValue(next);
      if (next <= LOW_STOCK_AT) {
        try {
          MailApp.sendEmail(OWNER_EMAIL,
            'OneCurve low stock: ' + name,
            'Only ' + next + ' left of "' + name + '" (id ' + id + '). Restock soon.');
        } catch (e) {}
      }
      return;
    }
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
