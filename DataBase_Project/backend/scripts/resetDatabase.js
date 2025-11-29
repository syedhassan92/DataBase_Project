/**
 * Drops and recreates the sports_management_db schema using schema-bcnf.sql
 * and then seeds it using seed-bcnf.sql.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await connection.query(sql);
}

async function main() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema-bcnf.sql');
  const seedPath = path.join(__dirname, '..', 'database', 'seed-bcnf.sql');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('Applying schema...');
    await runSqlFile(connection, schemaPath);
    await connection.query('USE sports_management_db');
    console.log('Seeding data...');
    await runSqlFile(connection, seedPath);
    console.log('Database reset complete.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Database reset failed:', err);
  process.exit(1);
});
