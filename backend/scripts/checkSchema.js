const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_management_db'
  });

  try {
    console.log('✓ Connected to database\n');

    // Check TOURNAMENT table structure
    const [tournamentCols] = await connection.query('DESCRIBE TOURNAMENT');
    console.log('TOURNAMENT table columns:');
    tournamentCols.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Key} ${col.Extra}`);
    });

    // Check if there's data in TOURNAMENT
    const [tournaments] = await connection.query('SELECT TournamentID, TournamentName, LeagueID, Description, Status FROM TOURNAMENT LIMIT 3');
    console.log('\nSample tournament data:');
    tournaments.forEach(t => {
      console.log(`  - ID: ${t.TournamentID}, Name: ${t.TournamentName}, LeagueID: ${t.LeagueID}, Status: ${t.Status}`);
    });

    // Check TOURNAMENTTEAM relationships
    const [ttCount] = await connection.query('SELECT COUNT(*) as count FROM TOURNAMENTTEAM');
    console.log(`\nTOURNAMENTTEAM relationships: ${ttCount[0].count}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema();
