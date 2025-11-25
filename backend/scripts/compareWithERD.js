const mysql = require('mysql2/promise');
require('dotenv').config();

async function compareSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_management_db'
  });

  try {
    console.log('Checking database schema against ERD...\n');

    // Define expected tables from ERD
    const expectedTables = {
      'USERACCOUNT': ['UserID', 'Username', 'Password', 'Role'],
      'ADMIN': ['AdminID', 'UserID', 'AdminName', 'Email'],
      'COACH': ['CoachID', 'CoachName', 'Contact', 'Experience'],
      'REFEREE': ['RefereeID', 'RefereeName', 'Contact', 'AvailabilityStatus'],
      'LEAGUE': ['LeagueID', 'AdminID', 'LeagueName', 'StartDate', 'EndDate'],
      'TOURNAMENT': ['TournamentID', 'AdminID', 'LeagueID', 'TournamentName', 'Description', 'StartDate', 'EndDate', 'Status'],
      'TEAM': ['TeamID', 'TeamName'],
      'TEAMLEAGUE': ['TeamLeagueID', 'TeamID', 'LeagueID', 'CoachID'],
      'TEAMSTATS': ['LeagueID', 'TeamID', 'Wins', 'Losses', 'Draws', 'Points'],
      'PLAYER': ['PlayerID', 'PlayerName', 'PlayerRole'],
      'PLAYERTEAM': ['PlayerTeamID', 'PlayerID', 'TeamID', 'ContractDetails', 'StartDate', 'EndDate', 'IsCurrent'],
      '`MATCH`': ['MatchID', 'LeagueID', 'TournamentID', 'VenueID', 'RefereeID', 'MatchDate', 'MatchTime', 'Status'],
      'MATCHSTATS': ['MatchStatsID', 'MatchID', 'TeamID', 'Score', 'Possession'],
      'VENUE': ['VenueID', 'VenueName', 'Location', 'Capacity', 'IsAvailable'],
      'TOURNAMENTTEAM': ['TournamentID', 'TeamID']
    };

    let allCorrect = true;

    for (const [tableName, expectedCols] of Object.entries(expectedTables)) {
      try {
        const [cols] = await connection.query(`DESCRIBE ${tableName}`);
        const actualCols = cols.map(c => c.Field);
        
        console.log(`✓ ${tableName}:`);
        
        // Check for missing columns
        const missing = expectedCols.filter(c => !actualCols.includes(c));
        if (missing.length > 0) {
          console.log(`  ⚠ Missing columns: ${missing.join(', ')}`);
          allCorrect = false;
        }
        
        // Show key columns
        const keys = cols.filter(c => c.Key === 'PRI' || c.Key === 'MUL');
        if (keys.length > 0) {
          console.log(`  Keys: ${keys.map(k => k.Field + (k.Key === 'PRI' ? ' (PK)' : ' (FK)')).join(', ')}`);
        }
        
      } catch (error) {
        console.log(`✗ ${tableName}: ${error.message}`);
        allCorrect = false;
      }
      console.log('');
    }

    if (allCorrect) {
      console.log('✅ All tables match the ERD schema!');
    } else {
      console.log('⚠️  Some discrepancies found between database and ERD.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

compareSchema();
