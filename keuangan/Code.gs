/**
 * BUKU SUMBANGAN ARDAN & YHOLA
 * Apps Script terpisah dari RSVP/UCAPAN.
 *
 * SETUP:
 * 1. Buat project Apps Script baru.
 * 2. Tempel seluruh kode ini.
 * 3. Jalankan setup() satu kali dan izinkan akses.
 * 4. Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 5. Salin URL /exec untuk dipasang di website keuangan.
 *
 * CATATAN: Endpoint publik tanpa login. Siapa pun yang mengetahui URL
 * dapat membaca dan mengubah data. Jangan gunakan untuk data sensitif.
 */
const SHEET_NAME = 'Sumbangan';

function setup() {
  const ss = SpreadsheetApp.create('Buku Sumbangan — Ardan & Yhola');
  const sheet = ss.getActiveSheet();
  sheet.setName(SHEET_NAME);
  sheet.appendRow(['ID', 'Nama', 'Jumlah', 'Tamu Dari', 'Dibuat Pada', 'Diperbarui Pada', 'Jenis Sumbangan', 'Isi Kado']);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#F3EBDD');
  sheet.setColumnWidths(1, 8, 170);
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('Spreadsheet dibuat: ' + ss.getUrl());
  return ss.getUrl();
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const callback = String(p.callback || '');
  let result;
  try {
    const action = String(p.action || 'list');
    if (action === 'list') result = { ok: true, data: readRows_() };
    else if (action === 'add') result = { ok: true, data: addRow_(p) };
    else if (action === 'update') result = { ok: true, data: updateRow_(p) };
    else if (action === 'delete') result = { ok: true, data: deleteRow_(p.id) };
    else result = { ok: false, error: 'Aksi tidak dikenal.' };
  } catch (err) {
    result = { ok: false, error: String(err.message || err) };
  }
  const json = JSON.stringify(result);
  if (callback && /^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Jalankan setup() terlebih dahulu.');
  const s = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  // Tambahkan kolom baru ke spreadsheet aktif tanpa membuat spreadsheet baru.
  if (s.getLastColumn() < 8) s.getRange(1, 7, 1, 2).setValues([['Jenis Sumbangan', 'Isi Kado']]);
  return s;
}
function readRows_() {
  const s = sheet_(), values = s.getDataRange().getValues();
  return values.slice(1).filter(r => r[0]).map(r => ({
    id: String(r[0]), name: String(r[1]), amount: Number(r[2] || 0),
    source: String(r[3]), createdAt: r[4] ? new Date(r[4]).toISOString() : '',
    updatedAt: r[5] ? new Date(r[5]).toISOString() : '',
    type: String(r[6] || ''), giftDescription: String(r[7] || '')
  }));
}
function addRow_(p) {
  const name = String(p.name || '').trim(), source = String(p.source || '').trim();
  const type = String(p.type || 'Amplop').trim(), giftDescription = String(p.giftDescription || '').trim();
  const isGift = type === 'Kado', amount = isGift ? 0 : Number(p.amount);
  if (!name || !source || (isGift ? !giftDescription : (!Number.isFinite(amount) || amount <= 0))) throw new Error('Nama, asal tamu, serta jumlah atau isi kado wajib diisi.');
  const id = Utilities.getUuid(), now = new Date();
  sheet_().appendRow([id, name, amount, source, now, now, type, giftDescription]);
  return { id, name, amount, source, type, giftDescription, createdAt: now.toISOString(), updatedAt: now.toISOString() };
}
function updateRow_(p) {
  const s = sheet_(), id = String(p.id || '');
  const name = String(p.name || '').trim(), source = String(p.source || '').trim();
  const type = String(p.type || 'Amplop').trim(), giftDescription = String(p.giftDescription || '').trim();
  const isGift = type === 'Kado', amount = isGift ? 0 : Number(p.amount), values = s.getDataRange().getValues();
  if (!id || !name || !source || (isGift ? !giftDescription : (!Number.isFinite(amount) || amount <= 0))) throw new Error('Data edit tidak lengkap.');
  for (let i = 1; i < values.length; i++) if (String(values[i][0]) === id) {
    const now = new Date();
    s.getRange(i + 1, 2, 1, 7).setValues([[name, amount, source, values[i][4], now, type, giftDescription]]);
    return { id, name, amount, source, type, giftDescription, updatedAt: now.toISOString() };
  }
  throw new Error('Catatan tidak ditemukan.');
}
function deleteRow_(id) {
  const s = sheet_(), values = s.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) if (String(values[i][0]) === String(id)) {
    s.deleteRow(i + 1); return { id: String(id) };
  }
  throw new Error('Catatan tidak ditemukan.');
}
