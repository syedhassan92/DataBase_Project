const db = require('../config/database');

async function populateTeamStats() {
  try {
    console.log('Populating TEAMSTATS table...\n');

    // Get all teams with their leagues
    const [teamLeagues] = await db.query(`
      SELECT tl.TeamID, tl.LeagueID, t.TeamName, l.LeagueName
      FROM TEAMLEAGUE tl
      JOIN TEAM t ON tl.TeamID = t.TeamID
      JOIN LEAGUE l ON tl.LeagueID = l.LeagueID
    `);

    if (teamLeagues.length === 0) {
      console.log('No teams found in leagues. Please assign teams to leagues first.');
      process.exit(0);
    }

    console.log(`Found ${teamLeagues.length} team-league associations:\n`);

    for (const tl of teamLeagues) {
      // Check if stats already exist
      const [existing] = await db.query(
        'SELECT * FROM TEAMSTATS WHERE LeagueID = ? AND TeamID = ?',
        [tl.LeagueID, tl.TeamID]
      );

      if (existing.length === 0) {
        // Insert initial stats
        await db.query(`
          INSERT INTO TEAMSTATS 
          (LeagueID, TeamID, Wins, Losses, Draws, Points, GoalsFor, GoalDifference, MatchesPlayed)
          VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)
        `, [tl.LeagueID, tl.TeamID]);
        
        console.log(`✓ Created stats for ${tl.TeamName} in ${tl.LeagueName}`);
      } else {
        console.log(`⊙ Stats already exist for ${tl.TeamName} in ${tl.LeagueName}`);
      }
    }

    console.log('\n✅ Successfully populated TEAMSTATS table');

    // Show summary
    const [count] = await db.query('SELECT COUNT(*) as count FROM TEAMSTATS');
    console.log(`\nTotal team stats records: ${count[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating team stats:', error.message);
    process.exit(1);
  }
}

populateTeamStats();
