const db = require('../config/database');

async function fixCompletedMatch() {
  try {
    console.log('Fixing the completed match and adding stats...\n');

    const matchId = 15; // The completed match
    
    // First, properly update the match with both scores
    await db.query(`
      UPDATE \`MATCH\` 
      SET Team2Score = 0 
      WHERE MatchID = ? AND Team2Score IS NULL
    `, [matchId]);
    
    console.log('✓ Fixed Team2Score (set to 0)\n');

    // Get match details
    const [matches] = await db.query(`
      SELECT m.*, t1.TeamName as Team1Name, t2.TeamName as Team2Name
      FROM \`MATCH\` m
      JOIN TEAM t1 ON m.Team1ID = t1.TeamID
      JOIN TEAM t2 ON m.Team2ID = t2.TeamID
      WHERE m.MatchID = ?
    `, [matchId]);

    const match = matches[0];
    console.log(`📊 Match details:`);
    console.log(`   ${match.Team1Name} (ID: ${match.Team1ID}) - Score: ${match.Team1Score}`);
    console.log(`   ${match.Team2Name} (ID: ${match.Team2ID}) - Score: ${match.Team2Score}\n`);

    // Manually insert MATCHSTATS
    console.log('📝 Inserting MATCHSTATS entries...');
    
    await db.query(`
      INSERT INTO MATCHSTATS (MatchID, TeamID, Score, Possession) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE Score = ?, Possession = ?
    `, [matchId, match.Team1ID, match.Team1Score, 50, match.Team1Score, 50]);
    
    console.log(`   ✓ Added stats for ${match.Team1Name}`);

    await db.query(`
      INSERT INTO MATCHSTATS (MatchID, TeamID, Score, Possession) 
      VALUES (?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE Score = ?, Possession = ?
    `, [matchId, match.Team2ID, match.Team2Score, 50, match.Team2Score, 50]);
    
    console.log(`   ✓ Added stats for ${match.Team2Name}\n`);

    // Verify the insert
    const [stats] = await db.query(`
      SELECT ms.*, t.TeamName
      FROM MATCHSTATS ms
      JOIN TEAM t ON ms.TeamID = t.TeamID
      WHERE ms.MatchID = ?
    `, [matchId]);

    console.log('✅ MATCHSTATS verification:');
    stats.forEach(stat => {
      console.log(`   ${stat.TeamName}: Score=${stat.Score}, Possession=${stat.Possession}%`);
    });

    // Now manually trigger TEAMSTATS update since the trigger might not have fired
    console.log('\n📊 Manually updating TEAMSTATS...');
    
    // Update Team1 stats
    await db.query(`
      UPDATE TEAMSTATS
      SET 
        MatchesPlayed = MatchesPlayed + 1,
        GoalsFor = GoalsFor + ?,
        GoalDifference = GoalDifference + (? - ?),
        Wins = Wins + CASE WHEN ? > ? THEN 1 ELSE 0 END,
        Draws = Draws + CASE WHEN ? = ? THEN 1 ELSE 0 END,
        Losses = Losses + CASE WHEN ? < ? THEN 1 ELSE 0 END,
        Points = Points + CASE 
          WHEN ? > ? THEN 3 
          WHEN ? = ? THEN 1 
          ELSE 0 
        END
      WHERE LeagueID = ? AND TeamID = ?
    `, [
      match.Team1Score, match.Team1Score, match.Team2Score,
      match.Team1Score, match.Team2Score,
      match.Team1Score, match.Team2Score,
      match.Team1Score, match.Team2Score,
      match.Team1Score, match.Team2Score,
      match.Team1Score, match.Team2Score,
      match.LeagueID, match.Team1ID
    ]);
    
    console.log(`   ✓ Updated stats for ${match.Team1Name}`);

    // Update Team2 stats
    await db.query(`
      UPDATE TEAMSTATS
      SET 
        MatchesPlayed = MatchesPlayed + 1,
        GoalsFor = GoalsFor + ?,
        GoalDifference = GoalDifference + (? - ?),
        Wins = Wins + CASE WHEN ? > ? THEN 1 ELSE 0 END,
        Draws = Draws + CASE WHEN ? = ? THEN 1 ELSE 0 END,
        Losses = Losses + CASE WHEN ? < ? THEN 1 ELSE 0 END,
        Points = Points + CASE 
          WHEN ? > ? THEN 3 
          WHEN ? = ? THEN 1 
          ELSE 0 
        END
      WHERE LeagueID = ? AND TeamID = ?
    `, [
      match.Team2Score, match.Team2Score, match.Team1Score,
      match.Team2Score, match.Team1Score,
      match.Team2Score, match.Team1Score,
      match.Team2Score, match.Team1Score,
      match.Team2Score, match.Team1Score,
      match.Team2Score, match.Team1Score,
      match.LeagueID, match.Team2ID
    ]);
    
    console.log(`   ✓ Updated stats for ${match.Team2Name}\n`);

    // Verify TEAMSTATS
    const [teamStats] = await db.query(`
      SELECT ts.*, t.TeamName
      FROM TEAMSTATS ts
      JOIN TEAM t ON ts.TeamID = t.TeamID
      WHERE ts.LeagueID = ?
      ORDER BY ts.Points DESC, ts.GoalDifference DESC
    `, [match.LeagueID]);

    console.log('✅ League standings:');
    teamStats.forEach(stat => {
      console.log(`   ${stat.TeamName}: MP=${stat.MatchesPlayed} W=${stat.Wins} D=${stat.Draws} L=${stat.Losses} GF=${stat.GoalsFor} GD=${stat.GoalDifference} Pts=${stat.Points}`);
    });

    console.log('\n✅ All fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixCompletedMatch();
