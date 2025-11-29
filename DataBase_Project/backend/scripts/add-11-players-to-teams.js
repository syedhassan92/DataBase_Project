const pool = require('../config/database.js');

const positions = ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CM', 'CM', 'LW', 'ST', 'RW'];
const firstNames = ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas', 'Daniel', 'Matthew', 'Carlos'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];

async function addPlayersToTeams() {
  try {
    // Get all existing teams
    const [teams] = await pool.query('SELECT TeamID, TeamName FROM team');
    
    console.log(`Found ${teams.length} teams`);

    for (const team of teams) {
      console.log(`\nAdding 11 players to ${team.TeamName}...`);
      
      for (let i = 0; i < 11; i++) {
        const firstName = firstNames[i];
        const lastName = lastNames[i];
        const playerName = `${firstName} ${lastName}`;
        const position = positions[i];
        
        // Insert player
        const [playerResult] = await pool.query(
          `INSERT INTO player (PlayerName, PlayerRole) 
           VALUES (?, ?)`,
          [playerName, position]
        );
        
        const playerID = playerResult.insertId;
        
        // Assign player to team
        const startDate = '2024-01-01';
        const endDate = '2026-12-31';
        await pool.query(
          `INSERT INTO playerteam (PlayerID, TeamID, StartDate, EndDate, IsCurrent) 
           VALUES (?, ?, ?, ?, 1)`,
          [playerID, team.TeamID, startDate, endDate]
        );
        
        console.log(`  Added ${playerName} (${position})`);
      }
      
      console.log(`✓ Successfully added 11 players to ${team.TeamName}`);
    }
    
    console.log('\n✓ All players added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

addPlayersToTeams();
