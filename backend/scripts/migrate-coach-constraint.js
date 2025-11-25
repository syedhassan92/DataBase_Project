const db = require('../config/database');

async function migrateCoachConstraint() {
  console.log('='.repeat(70));
  console.log('MIGRATION: Add Unique Constraint on CoachID in TEAMLEAGUE');
  console.log('='.repeat(70));
  
  try {
    // 1. Check for coaches currently assigned to multiple teams
    console.log('\n1. Checking for coaches assigned to multiple teams...\n');
    const [multiTeamCoaches] = await db.query(`
      SELECT 
        c.CoachID,
        c.CoachName,
        COUNT(DISTINCT tl.TeamID) as TeamCount,
        GROUP_CONCAT(DISTINCT CONCAT(t.TeamName, ' (', tl.TeamLeagueID, ')') SEPARATOR ', ') as Teams
      FROM COACH c
      JOIN TEAMLEAGUE tl ON c.CoachID = tl.CoachID
      JOIN TEAM t ON tl.TeamID = t.TeamID
      GROUP BY c.CoachID, c.CoachName
      HAVING TeamCount > 1
    `);
    
    if (multiTeamCoaches.length > 0) {
      console.log('⚠️  WARNING: Found coaches assigned to multiple teams:');
      multiTeamCoaches.forEach(coach => {
        console.log(`   ${coach.CoachName} (ID: ${coach.CoachID}) -> ${coach.TeamCount} teams`);
        console.log(`   Teams: ${coach.Teams}\n`);
      });
      
      console.log('These assignments must be resolved before adding the constraint.');
      console.log('\nOptions:');
      console.log('  1. Keep only the first team assignment for each coach');
      console.log('  2. Manually reassign coaches before running migration');
      console.log('  3. Set CoachID to NULL for duplicate assignments\n');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Choose option (1-3) or "cancel": ', resolve);
      });
      readline.close();
      
      if (answer === 'cancel') {
        console.log('Migration cancelled.');
        return;
      }
      
      if (answer === '1') {
        console.log('\nKeeping only first team assignment for each coach...');
        for (const coach of multiTeamCoaches) {
          // Get all team league IDs for this coach
          const [assignments] = await db.query(
            'SELECT TeamLeagueID FROM TEAMLEAGUE WHERE CoachID = ? ORDER BY TeamLeagueID',
            [coach.CoachID]
          );
          
          // Keep first, remove others
          const idsToRemove = assignments.slice(1).map(a => a.TeamLeagueID);
          if (idsToRemove.length > 0) {
            await db.query(
              'UPDATE TEAMLEAGUE SET CoachID = NULL WHERE TeamLeagueID IN (?)',
              [idsToRemove]
            );
            console.log(`   ${coach.CoachName}: Removed ${idsToRemove.length} duplicate assignment(s)`);
          }
        }
      } else if (answer === '3') {
        console.log('\nSetting CoachID to NULL for all duplicate assignments...');
        for (const coach of multiTeamCoaches) {
          const [assignments] = await db.query(
            'SELECT TeamLeagueID FROM TEAMLEAGUE WHERE CoachID = ? ORDER BY TeamLeagueID',
            [coach.CoachID]
          );
          
          const idsToNull = assignments.slice(1).map(a => a.TeamLeagueID);
          if (idsToNull.length > 0) {
            await db.query(
              'UPDATE TEAMLEAGUE SET CoachID = NULL WHERE TeamLeagueID IN (?)',
              [idsToNull]
            );
            console.log(`   ${coach.CoachName}: Set CoachID to NULL for ${idsToNull.length} assignment(s)`);
          }
        }
      } else {
        console.log('Invalid option. Please resolve manually and run again.');
        return;
      }
    } else {
      console.log('✅ No coaches assigned to multiple teams. Safe to proceed.');
    }
    
    // 2. Check if constraint already exists
    console.log('\n2. Checking existing constraints...\n');
    const [existingConstraints] = await db.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'TEAMLEAGUE'
        AND CONSTRAINT_NAME = 'unique_coach'
    `);
    
    if (existingConstraints.length > 0) {
      console.log('⚠️  Constraint "unique_coach" already exists. Skipping creation.');
    } else {
      // 3. Add the unique constraint
      console.log('3. Adding UNIQUE constraint on CoachID...\n');
      await db.query('ALTER TABLE TEAMLEAGUE ADD UNIQUE KEY unique_coach (CoachID)');
      console.log('✅ Constraint added successfully!');
    }
    
    // 4. Verify the constraint
    console.log('\n4. Verifying constraint...\n');
    const [verification] = await db.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'TEAMLEAGUE'
        AND CONSTRAINT_NAME = 'unique_coach'
    `);
    
    if (verification.length > 0) {
      console.log('✅ Constraint verified:');
      console.log(`   Name: ${verification[0].CONSTRAINT_NAME}`);
      console.log(`   Column: ${verification[0].COLUMN_NAME}`);
      console.log('   Effect: Each coach can now only be assigned to ONE team');
    }
    
    // 5. Test the constraint
    console.log('\n5. Testing constraint...\n');
    try {
      // Get a coach and two different teams
      const [coach] = await db.query('SELECT CoachID FROM COACH LIMIT 1');
      const [teams] = await db.query('SELECT TeamID FROM TEAM LIMIT 2');
      const [league] = await db.query('SELECT LeagueID FROM LEAGUE LIMIT 1');
      
      if (coach.length > 0 && teams.length >= 2 && league.length > 0) {
        // Try to create a test team
        const [testTeam] = await db.query('INSERT INTO TEAM (TeamName) VALUES (?)', ['TEST_CONSTRAINT_TEAM']);
        const testTeamId = testTeam.insertId;
        
        // This should fail if constraint is working
        try {
          const [existing] = await db.query(
            'SELECT TeamLeagueID FROM TEAMLEAGUE WHERE CoachID = ? LIMIT 1',
            [coach[0].CoachID]
          );
          
          if (existing.length > 0) {
            await db.query(
              'INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES (?, ?, ?)',
              [testTeamId, league[0].LeagueID, coach[0].CoachID]
            );
            console.log('❌ ERROR: Constraint not working! Coach was assigned to multiple teams.');
          } else {
            console.log('✅ Test skipped: Coach not currently assigned to any team');
          }
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log('✅ Constraint is working! Duplicate coach assignment was blocked.');
            console.log(`   Error: ${err.message}`);
          } else {
            throw err;
          }
        }
        
        // Cleanup
        await db.query('DELETE FROM TEAM WHERE TeamID = ?', [testTeamId]);
        console.log('   Test data cleaned up');
      }
    } catch (err) {
      console.log('⚠️  Could not complete test:', err.message);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('MIGRATION COMPLETE!');
    console.log('Each coach can now only be assigned to ONE team.');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrateCoachConstraint();
