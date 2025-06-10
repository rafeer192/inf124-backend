const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect() // test db connection
  .then(client => {
    console.log('✅ Successfully connected to PostgreSQL!');
    client.release();
  })
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = pool;