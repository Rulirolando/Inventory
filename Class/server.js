import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Mendapatkan __dirname dalam ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Express dan PostgreSQL
const app = express();
const PORT = 2000;
const { Client } = pg;

// Middleware
app.use(cors());
app.use(express.json());  // Untuk parsing JSON body
app.use(express.static(path.join(__dirname, 'public')));


const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '123456',  // Gantilah dengan password PostgreSQL Anda
    port: 5432,
});

client.connect().then(() => console.log('Connected to PostgreSQL')).catch(err => console.error('Connection error', err.stack));

// API untuk mendapatkan semua item
app.get('/api/inventory', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM items');
        res.json(result.rows);
    } catch (err) {
        console.error('Error saat mengambil item:', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API untuk menambahkan item
app.post('/api/inventory', async (req, res) => {
    const { name, quantity, price } = req.body;

    // Validasi input
    if (!name || quantity == null || price == null) {
        return res.status(400).json({ error: 'Nama, jumlah, dan harga harus diisi.' });
    }

    const query = 'INSERT INTO items (name, quantity, price) VALUES ($1, $2, $3) RETURNING id;';
    try {
        const result = await client.query(query, [name, quantity, price]);
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Error saat menambahkan item:', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API untuk memperbarui item
app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;

    // Validasi input
    if (!name || quantity == null || price == null) {
        return res.status(400).json({ error: 'Nama, jumlah, dan harga harus diisi.' });
    }

    const query = 'UPDATE items SET name = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING *;';
    try {
        const result = await client.query(query, [name, quantity, price, id]);

        // Periksa apakah item benar-benar diperbarui
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item tidak ditemukan.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error saat memperbarui item:', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API untuk menghapus item
app.delete('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;

    // Validasi input untuk memastikan ID adalah angka
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID tidak valid.' });
    }

    const query = 'DELETE FROM items WHERE id = $1 RETURNING *;';
    try {
        const result = await client.query(query, [id]);

        // Periksa apakah item benar-benar dihapus
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Item tidak ditemukan.' });
        }

        res.status(204).send(); // Mengirimkan status 204 jika berhasil dihapus
    } catch (err) {
        console.error('Error saat menghapus item:', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Menutup koneksi saat aplikasi dihentikan
process.on('SIGINT', async () => {
    await client.end();
    console.log('Koneksi PostgreSQL ditutup');
    process.exit(0);
});
