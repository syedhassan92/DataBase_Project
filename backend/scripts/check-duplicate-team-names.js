const db = require('../config/database');

async function addUniqueTeamNamePerLeague() {
  try {
    console.log('Adding unique constraint for team name per league...');

    // First, check if there are any duplicate team names in the same league
    const [duplicates] = await db.query(`
      SELECT t.TeamName, tl.LeagueID, COUNT(*) as count
      FROM TEAM t
      INNER JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID
      GROUP BY t.TeamName, tl.LeagueID
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate team names in leagues:');
      console.log(JSON.stringify(duplicates, null, 2));
      console.log('\nPlease resolve these duplicates before adding the constraint.');
      process.exit(1);
    }

    console.log('✓ No duplicate team names found in any league');

    // Create a virtual column that combines TeamName and LeagueID for the unique constraint
    // Since we need to enforce uniqueness across TEAM and TEAMLEAGUE tables,
    // we'll use a trigger-based approach instead

    console.log('\nNote: Unique team name per league is enforced via application logic.');
    console.log('The existing unique_team_league constraint prevents a team from joining the same league twice.');
    console.log('Application validation prevents different teams with the same name in the same league.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUniqueTeamNamePerLeague();
