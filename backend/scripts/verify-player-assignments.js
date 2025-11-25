const mysql = require('mysql2/promise');

async function verifyPlayerAssignments() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sports_management_db'
  });

  try {
    console.log('Verifying player assignments...\n');
    
    // Check for players assigned to multiple teams
    const [multipleTeams] = await connection.execute(`
      SELECT 
        p.PlayerID,
        p.PlayerName,
        COUNT(DISTINCT pt.TeamID) as team_count,
        GROUP_CONCAT(t.TeamName SEPARATOR ', ') as teams
      FROM PLAYER p
      JOIN PLAYERTEAM pt ON p.PlayerID = pt.PlayerID
      JOIN TEAM t ON pt.TeamID = t.TeamID
      WHERE pt.IsCurrent = TRUE
      GROUP BY p.PlayerID, p.PlayerName
      HAVING COUNT(DISTINCT pt.TeamID) > 1
    `);
    
    if (multipleTeams.length > 0) {
      console.log('⚠ WARNING: Found players assigned to multiple teams:');
      multipleTeams.forEach(player => {
        console.log(`  - ${player.PlayerName} (ID: ${player.PlayerID}): ${player.team_count} teams (${player.teams})`);
      });
    } else {
      console.log('✓ All players are assigned to at most one team');
    }
    
    // Show summary by team
    console.log('\nTeam rosters summary:');
    const [teams] = await connection.execute(`
      SELECT 
        t.TeamID,
        t.TeamName,
        COUNT(pt.PlayerID) as player_count
      FROM TEAM t
      LEFT JOIN PLAYERTEAM pt ON t.TeamID = pt.TeamID AND pt.IsCurrent = TRUE
      GROUP BY t.TeamID, t.TeamName
      ORDER BY t.TeamName
    `);
    
    teams.forEach(team => {
      const status = team.player_count === 11 ? '✓' : team.player_count > 11 ? '!' : '⚠';
      console.log(`  ${status} ${team.TeamName}: ${team.player_count} players`);
    });
    
    // Show breakdown by position for each team
    console.log('\nPosition breakdown by team:');
    for (const team of teams) {
      const [positions] = await connection.execute(`
        SELECT 
          p.PlayerRole,
          COUNT(*) as count
        FROM PLAYERTEAM pt
        JOIN PLAYER p ON pt.PlayerID = p.PlayerID
        WHERE pt.TeamID = ? AND pt.IsCurrent = TRUE
        GROUP BY p.PlayerRole
        ORDER BY 
          CASE p.PlayerRole
            WHEN 'Goalkeeper' THEN 1
            WHEN 'Defender' THEN 2
            WHEN 'Midfielder' THEN 3
            WHEN 'Forward' THEN 4
            ELSE 5
          END
      `, [team.TeamID]);
      
      console.log(`\n  ${team.TeamName}:`);
      positions.forEach(pos => {
        console.log(`    - ${pos.PlayerRole}: ${pos.count}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

verifyPlayerAssignments()
  .then(() => {
    console.log('\n✓ Verification completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
