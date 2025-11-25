const db = require('../config/database');

async function createMatchStatsTrigger() {
  try {
    console.log('Creating trigger to update TEAMSTATS when match is completed...\n');

    // Drop trigger if it exists
    await db.query('DROP TRIGGER IF EXISTS after_match_update');
    console.log('✓ Dropped existing trigger (if any)');

    // Create trigger to update TEAMSTATS when match is updated to Completed
    await db.query(`
      CREATE TRIGGER after_match_update
      AFTER UPDATE ON \`MATCH\`
      FOR EACH ROW
      BEGIN
        -- Only process if match status changed to 'Completed' and has scores
        IF NEW.Status = 'Completed' AND NEW.Team1Score IS NOT NULL AND NEW.Team2Score IS NOT NULL 
           AND (OLD.Status != 'Completed' OR OLD.Team1Score IS NULL OR OLD.Team2Score IS NULL) THEN
          
          -- Update Team1 stats
          IF NEW.LeagueID IS NOT NULL THEN
            UPDATE TEAMSTATS 
            SET 
              MatchesPlayed = MatchesPlayed + 1,
              GoalsFor = GoalsFor + NEW.Team1Score,
              GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
              Wins = CASE WHEN NEW.Team1Score > NEW.Team2Score THEN Wins + 1 ELSE Wins END,
              Draws = CASE WHEN NEW.Team1Score = NEW.Team2Score THEN Draws + 1 ELSE Draws END,
              Losses = CASE WHEN NEW.Team1Score < NEW.Team2Score THEN Losses + 1 ELSE Losses END,
              Points = Points + CASE 
                WHEN NEW.Team1Score > NEW.Team2Score THEN 3 
                WHEN NEW.Team1Score = NEW.Team2Score THEN 1 
                ELSE 0 
              END
            WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team1ID;
            
            -- Update Team2 stats
            UPDATE TEAMSTATS 
            SET 
              MatchesPlayed = MatchesPlayed + 1,
              GoalsFor = GoalsFor + NEW.Team2Score,
              GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
              Wins = CASE WHEN NEW.Team2Score > NEW.Team1Score THEN Wins + 1 ELSE Wins END,
              Draws = CASE WHEN NEW.Team2Score = NEW.Team1Score THEN Draws + 1 ELSE Draws END,
              Losses = CASE WHEN NEW.Team2Score < NEW.Team1Score THEN Losses + 1 ELSE Losses END,
              Points = Points + CASE 
                WHEN NEW.Team2Score > NEW.Team1Score THEN 3 
                WHEN NEW.Team2Score = NEW.Team1Score THEN 1 
                ELSE 0 
              END
            WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team2ID;
          END IF;
        END IF;
      END
    `);
    console.log('✓ Created trigger: after_match_update');

    console.log('\n✅ Successfully created trigger!');
    console.log('\nHow it works:');
    console.log('- When a match status changes to "Completed" with scores');
    console.log('- Automatically updates TEAMSTATS for both teams:');
    console.log('  • Matches Played +1');
    console.log('  • Goals For (adds team\'s score)');
    console.log('  • Goal Difference (GF - goals conceded)');
    console.log('  • Win/Draw/Loss counts');
    console.log('  • Points (3 for win, 1 for draw, 0 for loss)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating trigger:', error.message);
    process.exit(1);
  }
}

createMatchStatsTrigger();
