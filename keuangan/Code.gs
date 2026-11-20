/**
 * BUKU SUMBANGAN ARDAN & YHOLA
 * Backend memakai spreadsheet baru dengan 5 tab kategori.
 * Tidak menyentuh spreadsheet undangan RSVP/UCAPAN atau spreadsheet lama.
 */
const SPREADSHEET_ID = '10-GRpHrEzhJPpcPw2A4OqY49I-YepTXsCs-6E2qOutQ';
const CATEGORIES = ['Amplop', 'BCA Ardan', 'BCA Yhola', 'Mandiri Yhola', 'Kado'];
const HISTORY_SHEET = 'Riwayat';
const HEADER_ROW = 4;
const FIRST_DATA_ROW = 5;
const ID_COL = 6;

function doGet(e) {
  const p = (e && e.parameter) || {};
  let result;
  try {
    ensureSummaryFormulas_();
    const action = String(p.action || 'list');
    if (action === 'list') result = { ok: true, data: readRows_() };
    else if (action === 'history') result = { ok: true, data: readHistory_() };
    else if (action === 'add') result = { ok: true, data: addRow_(p) };
    else if (action === 'update') result = { ok: true, data: updateRow_(p) };
    else if (action === 'delete') result = { ok: true, data: deleteRow_(p.id) };
    else result = { ok: false, error: 'Aksi tidak dikenal.' };
  } catch (err) {
    result = { ok: false, error: String(err && err.message || err) };
  }
  return output_(result, p.callback);
}

function output_(result, callback) {
  const json = JSON.stringify(result);
  callback = String(callback || '');
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureSummaryFormulas_() {
  const ss = spreadsheet_();
  const summary = ss.getSheetByName('Rekap Utama');
  if (!summary) throw new Error('Tab Rekap Utama tidak ditemukan. Pastikan memakai spreadsheet template yang baru.');
  CATEGORIES.forEach((category, i) => {
    const row = 5 + i;
    summary.getRange(row, 2).setFormula("=COUNTA('" + category + "'!B5:B1004)");
    summary.getRange(row, 3).setFormula(category === 'Kado' ? '=0' : "=SUM('" + category + "'!D5:D1004)");
  });
  summary.getRange('B11').setFormula('=SUM(B5:B9)');
  summary.getRange('C11').setFormula('=SUM(C5:C9)');
  summary.getRange('B13').setFormula("=COUNTA('Kado'!B5:B1004)");
}

function categorySheet_(category) {
  if (CATEGORIES.indexOf(category) === -1) throw new Error('Kategori tidak valid: ' + category);
  const sh = spreadsheet_().getSheetByName(category);
  if (!sh) throw new Error('Tab ' + category + ' tidak ditemukan.');
  if (!String(sh.getRange(HEADER_ROW, ID_COL).getValue() || '').trim()) {
    sh.getRange(HEADER_ROW, ID_COL).setValue('ID');
    sh.hideColumns(ID_COL);
  }
  return sh;
}

function getRecordRows_(sh) {
  const last = Math.max(sh.getLastRow(), FIRST_DATA_ROW - 1);
  if (last < FIRST_DATA_ROW) return [];
  return sh.getRange(FIRST_DATA_ROW, 1, last - FIRST_DATA_ROW + 1, ID_COL).getValues();
}

function readRows_() {
  const result = [];
  CATEGORIES.forEach(category => {
    const sh = categorySheet_(category);
    getRecordRows_(sh).forEach((r, i) => {
      const id = String(r[5] || '');
      const name = String(r[1] || '');
      if (!id || !name) return;
      const isGift = category === 'Kado';
      const date = r[0] instanceof Date ? r[0] : (r[0] ? new Date(r[0]) : null);
      result.push({
        id: id,
        name: name,
        source: String(r[2] || ''),
        type: category,
        amount: isGift ? 0 : Number(r[3] || 0),
        giftDescription: isGift ? String(r[3] || '') : '',
        note: String(r[4] || ''),
        createdAt: date && !isNaN(date.getTime()) ? date.toISOString() : '',
        updatedAt: ''
      });
    });
  });
  return result.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function historySheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(HISTORY_SHEET);
  if (!sh) {
    sh = ss.insertSheet(HISTORY_SHEET);
    sh.appendRow(['Waktu', 'Aksi', 'ID Catatan', 'Nama', 'Detail']);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#F3EBDD');
  }
  return sh;
}

function logHistory_(action, item, detail) {
  historySheet_().appendRow([new Date(), action, item.id || '', item.name || '', detail || '']);
}

function readHistory_() {
  const sh = historySheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 5).getValues().reverse().slice(0, 100).map(r => ({
    timestamp: r[0] ? new Date(r[0]).toISOString() : '',
    action: String(r[1] || ''),
    id: String(r[2] || ''),
    name: String(r[3] || ''),
    detail: String(r[4] || '')
  }));
}

function normalizeItem_(p) {
  const type = String(p.type || 'Amplop').trim();
  const name = String(p.name || '').trim();
  const source = String(p.source || '').trim();
  const giftDescription = String(p.giftDescription || '').trim();
  const amount = type === 'Kado' ? 0 : Number(p.amount);
  if (CATEGORIES.indexOf(type) < 0) throw new Error('Pilih jenis sumbangan yang tersedia.');
  if (!name || !source) throw new Error('Nama dan asal tamu wajib diisi.');
  if (type === 'Kado' ? !giftDescription : (!Number.isFinite(amount) || amount <= 0)) {
    throw new Error(type === 'Kado' ? 'Isi kado wajib diisi.' : 'Jumlah sumbangan harus lebih dari nol.');
  }
  return { id: String(p.id || Utilities.getUuid()), name, source, type, amount, giftDescription, note: String(p.note || '').trim() };
}

function appendRecord_(item, dateValue) {
  const sh = categorySheet_(item.type);
  const last = Math.max(sh.getLastRow(), FIRST_DATA_ROW - 1);
  const row = Math.max(FIRST_DATA_ROW, last + 1);
  const detail = item.type === 'Kado' ? item.giftDescription : item.amount;
  sh.getRange(row, 1, 1, ID_COL).setValues([[
    dateValue || new Date(), item.name, item.source, detail, item.note || '', item.id
  ]]);
  if (item.type !== 'Kado') sh.getRange(row, 4).setNumberFormat('"Rp" #,##0');
  return row;
}

function findRecord_(id) {
  for (const category of CATEGORIES) {
    const sh = categorySheet_(category);
    const rows = getRecordRows_(sh);
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][5] || '') === String(id)) {
        return { sheet: sh, row: FIRST_DATA_ROW + i, category, values: rows[i] };
      }
    }
  }
  return null;
}

function addRow_(p) {
  const item = normalizeItem_(p);
  const now = new Date();
  appendRecord_(item, now);
  logHistory_('Tambah', item, item.type === 'Kado' ? 'Kado: ' + item.giftDescription : item.type + ' · Rp ' + item.amount);
  item.createdAt = now.toISOString();
  return item;
}

function updateRow_(p) {
  const item = normalizeItem_(p);
  if (!p.id) throw new Error('ID catatan tidak ditemukan.');
  const old = findRecord_(item.id);
  if (!old) throw new Error('Catatan tidak ditemukan.');
  const oldName = String(old.values[1] || '');
  const oldCategory = old.category;
  const oldDetail = old.category === 'Kado' ? String(old.values[3] || '') : 'Rp ' + Number(old.values[3] || 0);
  const oldDate = old.values[0] || new Date();
  old.sheet.deleteRow(old.row);
  appendRecord_(item, oldDate);
  logHistory_('Edit', item, 'Sebelumnya: ' + oldName + ' · ' + oldCategory + ' · ' + oldDetail + ' → Sekarang: ' + item.type + (item.type === 'Kado' ? ' · ' + item.giftDescription : ' · Rp ' + item.amount));
  item.createdAt = oldDate instanceof Date ? oldDate.toISOString() : '';
  item.updatedAt = new Date().toISOString();
  return item;
}

function deleteRow_(id) {
  if (!id) throw new Error('ID catatan tidak ditemukan.');
  const old = findRecord_(id);
  if (!old) throw new Error('Catatan tidak ditemukan.');
  const item = { id: String(id), name: String(old.values[1] || '') };
  const detail = old.category + ' · ' + String(old.values[2] || '');
  logHistory_('Hapus', item, detail);
  old.sheet.deleteRow(old.row);
  return { id: String(id) };
}
