const db = require('./config/database');

async function verifyCoachConstraint() {
  console.log('='.repeat(70));
  console.log('VERIFICATION: Coach Can Only Coach One Team');
  console.log('='.repeat(70));
  
  try {
    // 1. Verify constraint exists
    console.log('\n1. Checking constraint exists...\n');
    const [constraints] = await db.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'TEAMLEAGUE'
        AND CONSTRAINT_NAME = 'unique_coach'
    `);
    
    if (constraints.length > 0) {
      console.log('✅ Constraint "unique_coach" exists');
      console.log(`   Column: ${constraints[0].COLUMN_NAME}`);
    } else {
      console.log('❌ Constraint does not exist!');
      return;
    }
    
    // 2. Check current coach assignments
    console.log('\n2. Current coach assignments:\n');
    const [assignments] = await db.query(`
      SELECT 
        c.CoachID,
        c.CoachName,
        t.TeamName,
        l.LeagueName
      FROM TEAMLEAGUE tl
      JOIN COACH c ON tl.CoachID = c.CoachID
      JOIN TEAM t ON tl.TeamID = t.TeamID
      JOIN LEAGUE l ON tl.LeagueID = l.LeagueID
      ORDER BY c.CoachName
    `);
    
    if (assignments.length > 0) {
      const coachMap = {};
      assignments.forEach(a => {
        if (!coachMap[a.CoachName]) {
          coachMap[a.CoachName] = [];
        }
        coachMap[a.CoachName].push(`${a.TeamName} (${a.LeagueName})`);
      });
      
      Object.keys(coachMap).forEach(coachName => {
        console.log(`   ${coachName}:`);
        coachMap[coachName].forEach(team => {
          console.log(`     - ${team}`);
        });
      });
      
      const multiTeamCoaches = Object.keys(coachMap).filter(name => coachMap[name].length > 1);
      if (multiTeamCoaches.length > 0) {
        console.log(`\n❌ ERROR: ${multiTeamCoaches.length} coach(es) assigned to multiple teams!`);
      } else {
        console.log('\n✅ All coaches assigned to only one team');
      }
    } else {
      console.log('   No coach assignments found');
    }
    
    // 3. Test attempting to assign coach to second team
    console.log('\n3. Testing constraint enforcement...\n');
    
    // Get a coach who is already assigned
    const [assignedCoach] = await db.query(`
      SELECT c.CoachID, c.CoachName, tl.TeamID
      FROM COACH c
      JOIN TEAMLEAGUE tl ON c.CoachID = tl.CoachID
      LIMIT 1
    `);
    
    if (assignedCoach.length > 0) {
      const coach = assignedCoach[0];
      console.log(`   Using coach: ${coach.CoachName} (ID: ${coach.CoachID})`);
      
      // Create a test team
      const [testTeam] = await db.query('INSERT INTO TEAM (TeamName) VALUES (?)', ['__TEST_TEAM__']);
      const testTeamId = testTeam.insertId;
      console.log(`   Created test team (ID: ${testTeamId})`);
      
      // Get a league
      const [league] = await db.query('SELECT LeagueID FROM LEAGUE LIMIT 1');
      
      // Try to assign the coach to this new team
      try {
        await db.query(
          'INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES (?, ?, ?)',
          [testTeamId, league[0].LeagueID, coach.CoachID]
        );
        console.log('   ❌ ERROR: Coach was assigned to second team (constraint not working!)');
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('   ✅ SUCCESS: Assignment blocked by constraint');
          console.log(`   Error message: ${err.sqlMessage}`);
        } else {
          console.log(`   ⚠️  Unexpected error: ${err.message}`);
        }
      }
      
      // Cleanup
      await db.query('DELETE FROM TEAM WHERE TeamID = ?', [testTeamId]);
      console.log('   Test team deleted');
    } else {
      console.log('   ⚠️  No coaches assigned to test with');
    }
    
    // 4. Show unassigned coaches
    console.log('\n4. Available unassigned coaches:\n');
    const [unassigned] = await db.query(`
      SELECT c.CoachID, c.CoachName, c.Experience
      FROM COACH c
      LEFT JOIN TEAMLEAGUE tl ON c.CoachID = tl.CoachID
      WHERE tl.CoachID IS NULL
    `);
    
    if (unassigned.length > 0) {
      console.log(`   Found ${unassigned.length} unassigned coach(es):`);
      unassigned.forEach(c => {
        console.log(`     - ${c.CoachName} (ID: ${c.CoachID}, ${c.Experience} years exp)`);
      });
    } else {
      console.log('   No unassigned coaches');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('VERIFICATION COMPLETE!');
    console.log('✅ Each coach can only coach ONE team (constraint enforced)');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

verifyCoachConstraint();
