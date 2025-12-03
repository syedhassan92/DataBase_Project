const db = require('../config/database');

async function testMatchStatsUpdate() {
  try {
    console.log('Testing match stats update...\n');

    // Get the completed match
    const [completedMatches] = await db.query(`
      SELECT m.*, t1.TeamName as Team1Name, t2.TeamName as Team2Name
      FROM \`MATCH\` m
      JOIN TEAM t1 ON m.Team1ID = t1.TeamID
      JOIN TEAM t2 ON m.Team2ID = t2.TeamID
      WHERE m.Status = 'Completed'
      ORDER BY m.MatchID DESC
      LIMIT 1
    `);

    if (completedMatches.length === 0) {
      console.log('❌ No completed matches found');
      process.exit(1);
    }

    const match = completedMatches[0];
    console.log(`📊 Found completed match:`);
    console.log(`   Match ID: ${match.MatchID}`);
    console.log(`   ${match.Team1Name} ${match.Team1Score} - ${match.Team2Score} ${match.Team2Name}`);
    console.log(`   Status: ${match.Status}\n`);

    // Check MATCHSTATS table
    const [matchStats] = await db.query(`
      SELECT ms.*, t.TeamName
      FROM MATCHSTATS ms
      JOIN TEAM t ON ms.TeamID = t.TeamID
      WHERE ms.MatchID = ?
    `, [match.MatchID]);

    console.log(`📈 MATCHSTATS entries for this match:`);
    if (matchStats.length === 0) {
      console.log('   ❌ No match stats found!\n');
      console.log('This means the MATCHSTATS table is not being populated.');
      console.log('The issue is that match stats are not being inserted when the match is updated.\n');
    } else {
      console.log(`   ✓ Found ${matchStats.length} entries:\n`);
      matchStats.forEach(stat => {
        console.log(`   Team: ${stat.TeamName}`);
        console.log(`   Score: ${stat.Score}`);
        console.log(`   Possession: ${stat.Possession}%`);
        console.log(`   Created: ${stat.CreatedAt}\n`);
      });
    }

    // Check TEAMSTATS to see if trigger worked
    const [teamStats] = await db.query(`
      SELECT ts.*, t.TeamName
      FROM LEAGUETEAMSTATS ts
      JOIN TEAM t ON ts.TeamID = t.TeamID
      WHERE ts.LeagueID = ?
      ORDER BY ts.Points DESC
    `, [match.LeagueID]);

    console.log(`🏆 TEAMSTATS for league ${match.LeagueID}:`);
    if (teamStats.length === 0) {
      console.log('   ❌ No team stats found!\n');
    } else {
      console.log('');
      teamStats.forEach(stat => {
        console.log(`   ${stat.TeamName}: MP=${stat.MatchesPlayed} W=${stat.Wins} D=${stat.Draws} L=${stat.Losses} GF=${stat.GoalsFor} GD=${stat.GoalDifference} Pts=${stat.Points}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMatchStatsUpdate();
