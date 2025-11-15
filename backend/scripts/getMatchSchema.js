const mysql = require('mysql2/promise');
require('dotenv').config();

async function getMatchSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_management_db'
  });

  try {
    const [cols] = await connection.query('DESCRIBE `MATCH`');
    console.log('MATCH table fields:');
    cols.forEach(col => {
      if (col.Extra !== 'auto_increment') {
        console.log(`  ${col.Field} (${col.Type})${col.Null === 'NO' ? ' NOT NULL' : ''}${col.Default ? ' DEFAULT ' + col.Default : ''}`);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

getMatchSchema();
