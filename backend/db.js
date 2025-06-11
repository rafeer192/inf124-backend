const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

console.log('📦 DATABASE_URL =', process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect() // test db connection
  .then(client => {
    console.log('✅ Successfully connected to PostgreSQL!');
    client.release();
  })
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = pool;