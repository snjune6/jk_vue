// Simple Express server with MariaDB for inventory management
// DB connection is configured via environment variables. See README_BACKEND.md.

import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const PORT = Number(process.env.PORT) || 5174

const app = express()
app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jk_vue',
  connectionLimit: Number(process.env.DB_CONN_LIMIT) || 5,
  namedPlaceholders: true,
})

async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS inventory (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    etc VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`)
}

app.get('/inventory', async (_req, res) => {
  try {
    await ensureTable()
    const [rows] = await pool.query('SELECT id, name, stock, etc, created_at FROM inventory ORDER BY created_at DESC, id DESC')
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: String(e) })
  }
})

app.post('/inventory', async (req, res) => {
  try {
    await ensureTable()
    const { name, stock, etc } = req.body || {}
    if (!name || !Number.isFinite(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ error: 'Invalid payload' })
    }
    const [result] = await pool.query(
      'INSERT INTO inventory (name, stock, etc) VALUES (:name, :stock, :etc)',
      { name: String(name), stock: Number(stock), etc: etc ? String(etc) : null }
    )
    const [rows] = await pool.query('SELECT id, name, stock, etc, created_at FROM inventory WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: String(e) })
  }
})

app.put('/inventory/:id', async (req, res) => {
  try {
    await ensureTable()
    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' })
    }
    const { name, stock, etc } = req.body || {}

    const fields = []
    const params = { id }
    if (typeof name === 'string') {
      const trimmed = name.trim()
      if (!trimmed) return res.status(400).json({ error: 'name cannot be empty' })
      fields.push('name = :name')
      params.name = trimmed
    }
    if (stock !== undefined) {
      const s = Number(stock)
      if (!Number.isFinite(s) || s < 0) return res.status(400).json({ error: 'stock must be a non-negative number' })
      fields.push('stock = :stock')
      params.stock = s
    }
    if (etc !== undefined) {
      if (etc === null) {
        fields.push('etc = NULL')
      } else {
        fields.push('etc = :etc')
        params.etc = String(etc)
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    const [result] = await pool.query(`UPDATE inventory SET ${fields.join(', ')} WHERE id = :id`, params)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' })
    }
    const [rows] = await pool.query('SELECT id, name, stock, etc, created_at FROM inventory WHERE id = ?', [id])
    res.json(rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
