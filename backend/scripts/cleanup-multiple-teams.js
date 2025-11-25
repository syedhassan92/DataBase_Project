const mysql = require('mysql2/promise');

async function cleanupConflictingData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sports_management_db'
  });

  try {
    console.log('Checking for players with multiple current teams...\n');
    
    // Find all violations
    const [violations] = await connection.execute(`
      SELECT PlayerID, COUNT(*) as team_count
      FROM PLAYERTEAM
      WHERE IsCurrent = TRUE
      GROUP BY PlayerID
      HAVING COUNT(*) > 1
    `);
    
    if (violations.length === 0) {
      console.log('✓ No conflicting data found. All players have at most one current team.');
      return;
    }
    
    console.log(`Found ${violations.length} player(s) with multiple current teams:\n`);
    
    for (const violation of violations) {
      console.log(`Player ID ${violation.PlayerID}: ${violation.team_count} current teams`);
      
      // Get all current team assignments for this player
      const [assignments] = await connection.execute(`
        SELECT 
          pt.PlayerTeamID, 
          pt.PlayerID, 
          pt.TeamID, 
          t.TeamName, 
          p.PlayerName,
          pt.StartDate,
          pt.ContractDetails
        FROM PLAYERTEAM pt
        JOIN TEAM t ON pt.TeamID = t.TeamID
        JOIN PLAYER p ON pt.PlayerID = p.PlayerID
        WHERE pt.PlayerID = ? AND pt.IsCurrent = TRUE
        ORDER BY pt.StartDate DESC
      `, [violation.PlayerID]);
      
      console.log(`  Player: ${assignments[0].PlayerName}`);
      console.log('  Current teams:');
      assignments.forEach((a, idx) => {
        console.log(`    ${idx + 1}. ${a.TeamName} (Started: ${a.StartDate ? a.StartDate.toISOString().split('T')[0] : 'N/A'})`);
      });
      
      // Keep only the most recent assignment as current
      const keepCurrent = assignments[0];
      const makeInactive = assignments.slice(1);
      
      console.log(`\n  → Keeping: ${keepCurrent.TeamName} (most recent)`);
      console.log(`  → Deactivating: ${makeInactive.map(a => a.TeamName).join(', ')}\n`);
      
      // Update all except the most recent to inactive
      for (const assignment of makeInactive) {
        await connection.execute(`
          UPDATE PLAYERTEAM 
          SET IsCurrent = FALSE, 
              EndDate = CURDATE()
          WHERE PlayerTeamID = ?
        `, [assignment.PlayerTeamID]);
      }
    }
    
    console.log(`\n✓ Cleaned up ${violations.length} conflicting player assignment(s).`);
    console.log('Each player now has at most one current team.');
    
    // Verify cleanup
    const [remaining] = await connection.execute(`
      SELECT PlayerID, COUNT(*) as team_count
      FROM PLAYERTEAM
      WHERE IsCurrent = TRUE
      GROUP BY PlayerID
      HAVING COUNT(*) > 1
    `);
    
    if (remaining.length === 0) {
      console.log('\n✓ Verification passed: No conflicts remaining.');
    } else {
      console.log('\n⚠ Warning: Some conflicts still remain!');
    }
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

cleanupConflictingData()
  .then(() => {
    console.log('\nCleanup completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Cleanup failed:', err);
    process.exit(1);
  });
