console.log("here");
const pool = require('./db');

pool.connect()
  .then(client => {
    console.log('✅ Successfully connected to PostgreSQL!');
    client.release();
    process.exit(0); // Exit explicitly
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });