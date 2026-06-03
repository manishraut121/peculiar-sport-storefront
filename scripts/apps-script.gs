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

// ── RECONCILIATION REPORTING ───────────────────────────────────────────────
//
// Two pieces:
//   1. setupSummaryTab()  — run ONCE. Builds a live "Summary" tab of
//      formulas that auto-update: today's revenue split by channel and by
//      payment mode (this is your reconciliation view). Cash row = what reps
//      should physically hand in; UPI/Card rows reconcile to your statements.
//   2. sendDailyDigest()  — attach a daily time-trigger (Triggers → Add →
//      sendDailyDigest, time-driven, day timer e.g. 9pm). Emails you the day's
//      numbers + per-rep cash owed + low-stock list.

function setupSummaryTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  sh.clear();
  // Today's window: Orders col A = Timestamp, C = Channel, E = Amount, F = Mode.
  var tFrom = '">="&TODAY()', tTo = '"<"&TODAY()+1';
  var dateF = 'Orders!A:A,' + tFrom + ',Orders!A:A,' + tTo;
  var rows = [
    ['OneCurve — Daily Reconciliation', ''],
    ['Date', '=TEXT(TODAY(),"ddd, dd mmm yyyy")'],
    ['', ''],
    ['Channel', 'Revenue (Rs.)'],
    ['Online',  '=SUMIFS(Orders!E:E,' + dateF + ',Orders!C:C,"ONLINE")'],
    ['Offline', '=SUMIFS(Orders!E:E,' + dateF + ',Orders!C:C,"OFFLINE")'],
    ['Total',   '=SUMIFS(Orders!E:E,' + dateF + ')'],
    ['', ''],
    ['Payment Mode', 'Collected (Rs.)'],
    ['Cash',  '=SUMIFS(Orders!E:E,' + dateF + ',Orders!F:F,"Cash")'],
    ['UPI',   '=SUMIFS(Orders!E:E,' + dateF + ',Orders!F:F,"UPI")'],
    ['Card',  '=SUMIFS(Orders!E:E,' + dateF + ',Orders!F:F,"Card")'],
    ['', ''],
    ['Reconcile against', ''],
    ['Online digital -> Razorpay payout', '=SUMIFS(Orders!E:E,' + dateF + ',Orders!C:C,"ONLINE")'],
    ['Offline cash -> handed in by reps', '=SUMIFS(Orders!E:E,' + dateF + ',Orders!C:C,"OFFLINE",Orders!F:F,"Cash")'],
    ['Offline UPI -> UPI statement',      '=SUMIFS(Orders!E:E,' + dateF + ',Orders!C:C,"OFFLINE",Orders!F:F,"UPI")'],
    ['', ''],
    ['Orders today (count)', '=COUNTIFS(' + dateF + ')'],
    ['Stock value at cost (sum)', '=SUMPRODUCT(Stock!C2:C,Stock!D2:D)']
  ];
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.getRange('A1:B1').merge().setFontWeight('bold').setFontSize(14);
  sh.getRange('A4:B4').setFontWeight('bold');
  sh.getRange('A9:B9').setFontWeight('bold');
  sh.getRange('A14').setFontWeight('bold');
  sh.setColumnWidth(1, 280); sh.setColumnWidth(2, 160);
  return 'Summary tab ready.';
}

function sendDailyDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orders = ss.getSheetByName('Orders').getDataRange().getValues();
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var tot = 0, online = 0, offline = 0, cash = 0, upi = 0, card = 0, n = 0;
  var repCash = {};
  for (var r = 1; r < orders.length; r++) {
    var ts = orders[r][0]; if (!(ts instanceof Date)) continue;
    var d = new Date(ts); d.setHours(0, 0, 0, 0);
    if (d.getTime() !== today.getTime()) continue;
    var ch = orders[r][2], amt = Number(orders[r][4]) || 0, mode = orders[r][5], rep = orders[r][6] || 'rep';
    n++; tot += amt;
    if (ch === 'ONLINE') online += amt; else offline += amt;
    if (mode === 'Cash') { cash += amt; if (ch === 'OFFLINE') repCash[rep] = (repCash[rep] || 0) + amt; }
    else if (mode === 'UPI') upi += amt; else if (mode === 'Card') card += amt;
  }
  // Low stock list
  var stock = ss.getSheetByName('Stock').getDataRange().getValues();
  var low = [];
  for (var s = 1; s < stock.length; s++) {
    var st = Number(stock[s][2]);
    if (!isNaN(st) && st <= LOW_STOCK_AT) low.push(stock[s][1] + ': ' + st);
  }
  var rs = function (x) { return 'Rs.' + Number(x).toLocaleString('en-IN'); };
  var repLines = Object.keys(repCash).map(function (k) { return '  ' + k + ': ' + rs(repCash[k]); }).join('\n') || '  (none)';
  var body =
    'OneCurve — sales for ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'EEE dd MMM yyyy') + '\n\n' +
    'Orders: ' + n + '   Revenue: ' + rs(tot) + '\n\n' +
    'BY CHANNEL\n  Online:  ' + rs(online) + '\n  Offline: ' + rs(offline) + '\n\n' +
    'BY PAYMENT\n  Cash: ' + rs(cash) + '\n  UPI:  ' + rs(upi) + '\n  Card: ' + rs(card) + '\n\n' +
    'CASH OWED BY REPS (collect this)\n' + repLines + '\n\n' +
    'RECONCILE\n  Online digital -> Razorpay payout: ' + rs(online) + '\n' +
    '  Offline UPI -> UPI statement: ' + rs(upi - (cash ? 0 : 0)) + '\n\n' +
    'LOW STOCK (<= ' + LOW_STOCK_AT + ')\n  ' + (low.join('\n  ') || '(all healthy)') + '\n';
  MailApp.sendEmail(OWNER_EMAIL, 'OneCurve daily report — ' + rs(tot), body);
  return 'Digest sent.';
}

// Optional: live JSON summary for a future dashboard (GET the web-app URL).
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orders = ss.getSheetByName('Orders').getDataRange().getValues();
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var o = { online: 0, offline: 0, cash: 0, upi: 0, card: 0, orders: 0, total: 0 };
  for (var r = 1; r < orders.length; r++) {
    var ts = orders[r][0]; if (!(ts instanceof Date)) continue;
    var d = new Date(ts); d.setHours(0, 0, 0, 0);
    if (d.getTime() !== today.getTime()) continue;
    var amt = Number(orders[r][4]) || 0;
    o.orders++; o.total += amt;
    if (orders[r][2] === 'ONLINE') o.online += amt; else o.offline += amt;
    var m = orders[r][5];
    if (m === 'Cash') o.cash += amt; else if (m === 'UPI') o.upi += amt; else if (m === 'Card') o.card += amt;
  }
  return json(o);
}
