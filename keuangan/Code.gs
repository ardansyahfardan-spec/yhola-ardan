/**
 * BUKU SUMBANGAN ARDAN & YHOLA
 * Backend keuangan terpisah dari RSVP/UCAPAN.
 * PENTING: gunakan SPREADSHEET_ID yang sudah ada. Jangan jalankan setup()
 * lagi; fungsi ensureStructure_() akan menambah struktur yang diperlukan.
 */
const SHEET_NAME = 'Sumbangan';
const HISTORY_SHEET_NAME = 'Riwayat';

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || '');
  let result;
  try {
    const action = String(p.action || 'list');
    if (action === 'list') result = { ok: true, data: readRows_() };
    else if (action === 'history') result = { ok: true, data: readHistory_() };
    else if (action === 'add') result = { ok: true, data: addRow_(p) };
    else if (action === 'update') result = { ok: true, data: updateRow_(p) };
    else if (action === 'delete') result = { ok: true, data: deleteRow_(p.id) };
    else result = { ok: false, error: 'Aksi tidak dikenal.' };
  } catch (err) {
    result = { ok: false, error: String(err.message || err) };
  }
  const json = JSON.stringify(result);
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum ditemukan. Jangan buat spreadsheet baru; periksa project Apps Script yang digunakan.');
  return SpreadsheetApp.openById(id);
}

function sheet_() {
  const ss = spreadsheet_();
  let s = ss.getSheetByName(SHEET_NAME);
  if (!s) throw new Error('Sheet Sumbangan tidak ditemukan. Data lama tidak diubah.');
  const headers = ['ID', 'Nama', 'Jumlah', 'Tamu Dari', 'Dibuat Pada', 'Diperbarui Pada', 'Jenis Sumbangan', 'Isi Kado'];
  const current = s.getRange(1, 1, 1, Math.max(s.getLastColumn(), 1)).getValues()[0].map(String);
  headers.forEach((h, i) => {
    if (current.indexOf(h) === -1) {
      const emptyCol = current.findIndex(v => !v);
      const col = emptyCol >= 0 ? emptyCol + 1 : s.getLastColumn() + 1;
      s.getRange(1, col).setValue(h);
      current[col - 1] = h;
    }
  });
  return s;
}

function historySheet_() {
  const ss = spreadsheet_();
  let h = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!h) {
    h = ss.insertSheet(HISTORY_SHEET_NAME);
    h.appendRow(['Waktu', 'Aksi', 'ID Catatan', 'Nama', 'Detail']);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#F3EBDD');
  }
  return h;
}

function logHistory_(action, item, detail) {
  historySheet_().appendRow([new Date(), action, String(item.id || ''), String(item.name || ''), detail || '']);
}

function readRows_() {
  const s = sheet_(), values = s.getDataRange().getValues();
  const headers = values[0].map(String), col = name => headers.indexOf(name);
  return values.slice(1).filter(r => r[col('ID')] !== '' && r[col('ID')] != null).map(r => ({
    id: String(r[col('ID')]), name: String(r[col('Nama')] || ''),
    amount: Number(r[col('Jumlah')] || 0), source: String(r[col('Tamu Dari')] || ''),
    createdAt: r[col('Dibuat Pada')] ? new Date(r[col('Dibuat Pada')]).toISOString() : '',
    updatedAt: r[col('Diperbarui Pada')] ? new Date(r[col('Diperbarui Pada')]).toISOString() : '',
    type: String(r[col('Jenis Sumbangan')] || 'Belum dikategorikan'),
    giftDescription: String(r[col('Isi Kado')] || '')
  }));
}

function readHistory_() {
  const h = historySheet_(), values = h.getDataRange().getValues();
  return values.slice(1).reverse().slice(0, 100).map(r => ({
    timestamp: r[0] ? new Date(r[0]).toISOString() : '',
    action: String(r[1] || ''), id: String(r[2] || ''),
    name: String(r[3] || ''), detail: String(r[4] || '')
  }));
}

function addRow_(p) {
  const name = String(p.name || '').trim(), source = String(p.source || '').trim();
  const type = String(p.type || 'Amplop').trim(), giftDescription = String(p.giftDescription || '').trim();
  const isGift = type === 'Kado', amount = isGift ? 0 : Number(p.amount);
  if (!name || !source || (isGift ? !giftDescription : (!Number.isFinite(amount) || amount <= 0))) throw new Error('Nama, asal tamu, serta jumlah atau isi kado wajib diisi.');
  const id = Utilities.getUuid(), now = new Date();
  const item = { id, name, amount, source, type, giftDescription };
  const s = sheet_(), headers = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
  const row = headers.map(h => ({
    'ID': id, 'Nama': name, 'Jumlah': amount, 'Tamu Dari': source,
    'Dibuat Pada': now, 'Diperbarui Pada': now,
    'Jenis Sumbangan': type, 'Isi Kado': giftDescription
  }[h] !== undefined ? ({
    'ID': id, 'Nama': name, 'Jumlah': amount, 'Tamu Dari': source,
    'Dibuat Pada': now, 'Diperbarui Pada': now,
    'Jenis Sumbangan': type, 'Isi Kado': giftDescription
  }[h]) : ''));
  s.appendRow(row);
  logHistory_('Tambah', item, type === 'Kado' ? 'Kado: ' + giftDescription : type + ' · Rp ' + amount);
  item.createdAt = now.toISOString(); item.updatedAt = now.toISOString();
  return item;
}

function updateRow_(p) {
  const s = sheet_(), id = String(p.id || '');
  const name = String(p.name || '').trim(), source = String(p.source || '').trim();
  const type = String(p.type || 'Amplop').trim(), giftDescription = String(p.giftDescription || '').trim();
  const isGift = type === 'Kado', amount = isGift ? 0 : Number(p.amount);
  if (!id || !name || !source || (isGift ? !giftDescription : (!Number.isFinite(amount) || amount <= 0))) throw new Error('Data edit tidak lengkap.');
  const values = s.getDataRange().getValues(), headers = values[0].map(String);
  for (let i = 1; i < values.length; i++) if (String(values[i][headers.indexOf('ID')]) === id) {
    const oldName = String(values[i][headers.indexOf('Nama')] || '');
    const oldType = String(values[i][headers.indexOf('Jenis Sumbangan')] || 'Belum dikategorikan');
    const oldAmount = Number(values[i][headers.indexOf('Jumlah')] || 0);
    const now = new Date(), item = { id, name, amount, source, type, giftDescription };
    const updates = {
      'Nama': name, 'Jumlah': amount, 'Tamu Dari': source,
      'Diperbarui Pada': now, 'Jenis Sumbangan': type, 'Isi Kado': giftDescription
    };
    Object.keys(updates).forEach(key => s.getRange(i + 1, headers.indexOf(key) + 1).setValue(updates[key]));
    logHistory_('Edit', item, 'Sebelumnya: ' + oldName + ' · ' + oldType + ' · Rp ' + oldAmount + ' → Sekarang: ' + type + (isGift ? ' · ' + giftDescription : ' · Rp ' + amount));
    item.updatedAt = now.toISOString();
    return item;
  }
  throw new Error('Catatan tidak ditemukan.');
}

function deleteRow_(id) {
  const s = sheet_(), values = s.getDataRange().getValues(), headers = values[0].map(String);
  for (let i = 1; i < values.length; i++) if (String(values[i][headers.indexOf('ID')]) === String(id)) {
    const item = { id: String(id), name: String(values[i][headers.indexOf('Nama')] || '') };
    const detail = String(values[i][headers.indexOf('Jenis Sumbangan')] || '') + ' · ' + String(values[i][headers.indexOf('Tamu Dari')] || '');
    logHistory_('Hapus', item, detail);
    s.deleteRow(i + 1);
    return { id: String(id) };
  }
  throw new Error('Catatan tidak ditemukan.');
}
