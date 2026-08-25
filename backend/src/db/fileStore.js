/**
 * fileStore.js
 * ─────────────────────────────────────────────────────
 * طبقة persistence بسيطة — تحفظ البيانات في ملفات JSON
 * داخل backend/src/db/data/ وتحمّلها عند بدء الخادم.
 *
 * الاستخدام:
 *   const store = createFileStore('users', defaultData);
 *   store.get()          // القراءة (من الذاكرة)
 *   store.set(newData)   // الكتابة للذاكرة + الملف
 *   store.update(fn)     // تعديل جزئي: fn(current) => newData
 * ─────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function createFileStore(name, defaultValue = []) {
  const filePath = path.join(DATA_DIR, `${name}.json`);

  // ── تحميل عند بدء الخادم ───────────────────────────
  let cache;
  try {
    if (fs.existsSync(filePath)) {
      cache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      cache = defaultValue;
      _write(cache);
    }
  } catch (e) {
    console.warn(`[fileStore] Failed to load ${name}.json, using default.`, e.message);
    cache = defaultValue;
  }

  function _write(data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error(`[fileStore] Failed to write ${name}.json:`, e.message);
    }
  }

  return {
    get:    ()     => cache,
    set:    (data) => { cache = data; _write(data); },
    update: (fn)   => { cache = fn(cache); _write(cache); },
    path:   filePath,
  };
}

module.exports = { createFileStore };
