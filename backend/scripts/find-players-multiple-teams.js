const pool = require('../config/database.js');

async function findPlayersInMultipleTeams() {
  try {
    const [duplicates] = await pool.query(`
      SELECT 
        p.PlayerID, 
        p.PlayerName, 
        COUNT(DISTINCT pt.TeamID) as team_count, 
        GROUP_CONCAT(t.TeamName SEPARATOR ', ') as teams
      FROM player p
      JOIN playerteam pt ON p.PlayerID = pt.PlayerID
      JOIN team t ON pt.TeamID = t.TeamID
      WHERE pt.IsCurrent = 1
      GROUP BY p.PlayerID, p.PlayerName
      HAVING team_count > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('✓ No players found in multiple teams');
    } else {
      console.log(`Found ${duplicates.length} player(s) assigned to multiple teams:\n`);
      duplicates.forEach(player => {
        console.log(`- ${player.PlayerName} (ID: ${player.PlayerID})`);
        console.log(`  Assigned to ${player.team_count} teams: ${player.teams}\n`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

findPlayersInMultipleTeams();
