// db.js
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
    user: '',        // Ganti dengan username PostgreSQL kamu
    host: '',       // Ganti dengan host, defaultnya localhost
    database: '',        // Nama database yang telah dibuat
    password: '',      // Ganti dengan password PostgreSQL kamu
    port:''               // Port default PostgreSQL adalah 5432
});

async function connectDB() {
    try {
        await client.connect();
        console.log('Terhubung ke database PostgreSQL');
    } catch (err) {
        console.error('Terjadi kesalahan:', err.stack);
    }
}

async function disconnectDB() {
    await client.end();
    console.log('Koneksi ditutup');
}

export { client, connectDB, disconnectDB };