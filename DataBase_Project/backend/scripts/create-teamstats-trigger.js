const db = require('../config/database');

async function createTeamStatsTrigger() {
  try {
    console.log('Creating trigger for automatic TEAMSTATS population...\n');

    // Drop trigger if it exists
    await db.query('DROP TRIGGER IF EXISTS after_teamleague_insert');
    console.log('✓ Dropped existing trigger (if any)');

    // Create trigger to auto-populate TEAMSTATS when team is added to league
    await db.query(`
      CREATE TRIGGER after_teamleague_insert
      AFTER INSERT ON TEAMLEAGUE
      FOR EACH ROW
      BEGIN
        INSERT INTO TEAMSTATS 
        (LeagueID, TeamID, Wins, Losses, Draws, Points, GoalsFor, GoalDifference, MatchesPlayed)
        VALUES (NEW.LeagueID, NEW.TeamID, 0, 0, 0, 0, 0, 0, 0)
        ON DUPLICATE KEY UPDATE LeagueID = NEW.LeagueID;
      END
    `);
    console.log('✓ Created trigger: after_teamleague_insert');

    console.log('\n✅ Successfully created trigger!');
    console.log('Now whenever a team is assigned to a league, stats will be automatically created.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating trigger:', error.message);
    process.exit(1);
  }
}

createTeamStatsTrigger();
