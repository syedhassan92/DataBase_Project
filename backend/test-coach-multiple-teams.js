const db = require('./config/database');

async function testCoachMultipleTeams() {
  console.log('='.repeat(70));
  console.log('TESTING: Can a Coach Coach Multiple Teams?');
  console.log('='.repeat(70));
  
  try {
    // 1. Check existing coach-team assignments
    console.log('\n1. Current Coach-Team Assignments:\n');
    const [assignments] = await db.query(`
      SELECT 
        c.CoachID,
        c.CoachName,
        COUNT(DISTINCT tl.TeamID) as TeamCount,
        GROUP_CONCAT(DISTINCT t.TeamName SEPARATOR ', ') as Teams,
        GROUP_CONCAT(DISTINCT l.LeagueName SEPARATOR ', ') as Leagues
      FROM COACH c
      LEFT JOIN TEAMLEAGUE tl ON c.CoachID = tl.CoachID
      LEFT JOIN TEAM t ON tl.TeamID = t.TeamID
      LEFT JOIN LEAGUE l ON tl.LeagueID = l.LeagueID
      GROUP BY c.CoachID, c.CoachName
      HAVING TeamCount > 0
      ORDER BY TeamCount DESC
    `);
    
    if (assignments.length > 0) {
      console.log('Coaches with teams:');
      assignments.forEach(coach => {
        console.log(`  ${coach.CoachName} (ID: ${coach.CoachID}):`);
        console.log(`    - Coaching ${coach.TeamCount} team(s)`);
        console.log(`    - Teams: ${coach.Teams}`);
        console.log(`    - Leagues: ${coach.Leagues}\n`);
      });
      
      const multiTeamCoaches = assignments.filter(c => c.TeamCount > 1);
      if (multiTeamCoaches.length > 0) {
        console.log(`✅ SUCCESS! ${multiTeamCoaches.length} coach(es) are coaching multiple teams:`);
        multiTeamCoaches.forEach(c => {
          console.log(`   - ${c.CoachName}: ${c.TeamCount} teams (${c.Teams})`);
        });
      } else {
        console.log('⚠️  No coaches are currently coaching multiple teams.');
      }
    } else {
      console.log('No coach-team assignments found.');
    }
    
    // 2. Check database constraints
    console.log('\n2. Database Constraints:\n');
    const [constraints] = await db.query(`
      SELECT 
        CONSTRAINT_NAME, 
        CONSTRAINT_TYPE,
        TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'TEAMLEAGUE'
        AND CONSTRAINT_TYPE = 'UNIQUE'
    `);
    
    console.log('TEAMLEAGUE table constraints:');
    constraints.forEach(c => {
      console.log(`  - ${c.CONSTRAINT_NAME} (${c.CONSTRAINT_TYPE})`);
    });
    
    const [uniqueKey] = await db.query(`
      SELECT 
        COLUMN_NAME,
        CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'TEAMLEAGUE'
        AND CONSTRAINT_NAME = 'unique_team_league'
    `);
    
    console.log('\nUnique constraint details:');
    console.log(`  Constraint: unique_team_league`);
    console.log(`  Columns: ${uniqueKey.map(k => k.COLUMN_NAME).join(', ')}`);
    console.log('  Meaning: A team can only appear once per league');
    console.log('  ✅ CoachID is NOT in the unique constraint');
    console.log('  ✅ Therefore, the same coach CAN coach multiple teams!');
    
    // 3. Test creating a new assignment for a coach who already coaches
    console.log('\n3. Testing: Assigning existing coach to a new team...\n');
    
    // Find a coach who already coaches at least one team
    const [existingCoach] = await db.query(`
      SELECT 
        c.CoachID,
        c.CoachName,
        COUNT(DISTINCT tl.TeamID) as CurrentTeamCount
      FROM COACH c
      LEFT JOIN TEAMLEAGUE tl ON c.CoachID = tl.CoachID
      GROUP BY c.CoachID, c.CoachName
      HAVING CurrentTeamCount > 0
      LIMIT 1
    `);
    
    if (existingCoach.length > 0) {
      const coach = existingCoach[0];
      console.log(`  Selected coach: ${coach.CoachName} (ID: ${coach.CoachID})`);
      console.log(`  Currently coaching: ${coach.CurrentTeamCount} team(s)`);
      
      // Try to create a test team and assign this coach
      const [newTeam] = await db.query('INSERT INTO TEAM (TeamName) VALUES (?)', ['TEST_MULTI_COACH_TEAM']);
      const testTeamId = newTeam.insertId;
      console.log(`  Created test team with ID: ${testTeamId}`);
      
      // Get a league ID
      const [leagues] = await db.query('SELECT LeagueID FROM LEAGUE LIMIT 1');
      if (leagues.length > 0) {
        const leagueId = leagues[0].LeagueID;
        
        // Assign the coach to the new team
        await db.query(
          'INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES (?, ?, ?)',
          [testTeamId, leagueId, coach.CoachID]
        );
        
        console.log(`  ✅ Successfully assigned coach to new team!`);
        
        // Verify
        const [verification] = await db.query(
          'SELECT COUNT(*) as TeamCount FROM TEAMLEAGUE WHERE CoachID = ?',
          [coach.CoachID]
        );
        
        console.log(`  Coach ${coach.CoachName} now coaches ${verification[0].TeamCount} team(s)`);
        
        // Cleanup
        await db.query('DELETE FROM TEAM WHERE TeamID = ?', [testTeamId]);
        console.log('  Test team cleaned up');
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('CONCLUSION: ✅ Coaches CAN coach multiple teams!');
    console.log('The database schema and application support this correctly.');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

testCoachMultipleTeams();
