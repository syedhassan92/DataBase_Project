const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
  });

  try {
    // Insert seed data
    const seedSQL = fs.readFileSync('./database/seed.sql', 'utf8')
      .replace(/USE.*;/gi, '')
      .replace(/INSERT INTO MATCH/g, 'INSERT INTO `MATCH`');
    
    const statements = seedSQL.split(';').filter(s => s.trim());
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await connection.query(stmt);
        } catch (e) {
          // Skip duplicate entries
        }
      }
    }

    const [leagues] = await connection.query('SELECT * FROM LEAGUE');
    const [teams] = await connection.query('SELECT * FROM TEAM');
    
    console.log(`✅ Seeded: ${leagues.length} leagues, ${teams.length} teams`);
    
  } finally {
    await connection.end();
  }
}

seedDatabase();
