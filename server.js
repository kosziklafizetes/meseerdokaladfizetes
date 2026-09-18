const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const Database = require('better-sqlite3');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kosziklanapok';
const ACCOUNT_NAME = process.env.ACCOUNT_NAME || 'IDE ÍRD BE A SZÁMLATULAJDONOS NEVÉT';
const ACCOUNT_NUMBER = process.env.ACCOUNT_NUMBER || 'IDE ÍRD BE A SZÁMLASZÁMOT';
const usePostgres = Boolean(process.env.DATABASE_URL);

let db;
let pool;

async function initDatabase() {
  if (usePostgres) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 5
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        standard_qty INTEGER NOT NULL DEFAULT 0,
        vip_qty INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Adatbázis: Render PostgreSQL');
  } else {
    db = new Database(path.join(__dirname, 'data', 'registrations.db'));
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        standard_qty INTEGER NOT NULL DEFAULT 0,
        vip_qty INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
      )
    `);
    console.log('Adatbázis: helyi SQLite');
  }
}

async function insertRegistration(v) {
  const total = v.standardQty * 1990 + v.vipQty * 7990;
  if (usePostgres) {
    const result = await pool.query(
      `INSERT INTO registrations (name,email,phone,standard_qty,vip_qty,total)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [v.name, v.email, v.phone, v.standardQty, v.vipQty, total]
    );
    return { id: result.rows[0].id, total };
  }

  const stmt = db.prepare(`INSERT INTO registrations (name,email,phone,standard_qty,vip_qty,total) VALUES (?,?,?,?,?,?)`);
  const result = stmt.run(v.name, v.email, v.phone, v.standardQty, v.vipQty, total);
  return { id: result.lastInsertRowid, total };
}

async function getRegistrations() {
  if (usePostgres) {
    const result = await pool.query(`
      SELECT id,name,email,phone,standard_qty,vip_qty,total,
             TO_CHAR(created_at AT TIME ZONE 'Europe/Budapest', 'YYYY-MM-DD HH24:MI:SS') AS created_at
      FROM registrations ORDER BY id DESC
    `);
    return result.rows;
  }
  return db.prepare('SELECT id,name,email,phone,standard_qty,vip_qty,total,created_at FROM registrations ORDER BY id DESC').all();
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validRegistration(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const standardQty = Number(body.standardQty);
  const vipQty = Number(body.vipQty);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.includes('@');
  const phoneOk = /^\+36\d{9}$/.test(phone);
  const qtyOk = Number.isInteger(standardQty) && Number.isInteger(vipQty) && standardQty >= 0 && vipQty >= 0 && (standardQty + vipQty) > 0 && standardQty <= 50 && vipQty <= 50;
  return { name, email, phone, standardQty, vipQty, emailOk, phoneOk, qtyOk };
}

app.post('/api/registrations', async (req, res) => {
  try {
    const v = validRegistration(req.body);
    if (!v.name || !v.emailOk || !v.phoneOk || !v.qtyOk) {
      return res.status(400).json({ ok: false, message: 'Kérjük, ellenőrizd a nevet, az e-mail címet, a telefonszámot és a jegydarabszámot.' });
    }
    const saved = await insertRegistration(v);
    res.json({ ok: true, id: saved.id, total: saved.total, accountName: ACCOUNT_NAME, accountNumber: ACCOUNT_NUMBER });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'A regisztráció mentése közben hiba történt. Kérjük, próbáld újra.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const password = String(req.body.password || '');
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, message: 'Hibás jelszó.' });
  res.json({ ok: true });
});

app.get('/api/admin/registrations', async (req, res) => {
  if (String(req.headers['x-admin-password'] || '') !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, message: 'Nincs jogosultság.' });
  try {
    const rows = await getRegistrations();
    res.json({ ok: true, rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Az adatok lekérése közben hiba történt.' });
  }
});

app.get('/api/settings', (_req, res) => {
  res.json({ accountName: ACCOUNT_NAME, accountNumber: ACCOUNT_NUMBER });
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      const url = `http://localhost:${PORT}`;
      console.log(`Meseerdő Kalandnap fut a ${PORT} porton.`);
      // Helyben megnyitja a böngészőt. Renderen nem futtatunk grafikus böngészőnyitást.
      if (!process.env.RENDER) {
        const command = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
        exec(command, () => {});
      }
    });
  })
  .catch((error) => {
    console.error('Az adatbázis inicializálása sikertelen:', error);
    process.exit(1);
  });
