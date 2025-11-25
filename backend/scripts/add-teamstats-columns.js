const db = require('../config/database');

async function addTeamStatsColumns() {
  try {
    console.log('Adding new columns to TEAMSTATS table...');

    // Add GoalsFor column
    await db.query(`
      ALTER TABLE TEAMSTATS 
      ADD COLUMN IF NOT EXISTS GoalsFor INT DEFAULT 0 AFTER Points
    `);
    console.log('✓ Added GoalsFor column');

    // Add GoalsAgainst column
    await db.query(`
      ALTER TABLE TEAMSTATS 
      ADD COLUMN IF NOT EXISTS GoalsAgainst INT DEFAULT 0 AFTER GoalsFor
    `);
    console.log('✓ Added GoalsAgainst column');

    // Add GoalDifference column
    await db.query(`
      ALTER TABLE TEAMSTATS 
      ADD COLUMN IF NOT EXISTS GoalDifference INT DEFAULT 0 AFTER GoalsAgainst
    `);
    console.log('✓ Added GoalDifference column');

    // Add MatchesPlayed column
    await db.query(`
      ALTER TABLE TEAMSTATS 
      ADD COLUMN IF NOT EXISTS MatchesPlayed INT DEFAULT 0 AFTER GoalDifference
    `);
    console.log('✓ Added MatchesPlayed column');

    // Update existing records to calculate MatchesPlayed from Wins + Losses + Draws
    await db.query(`
      UPDATE TEAMSTATS 
      SET MatchesPlayed = Wins + Losses + Draws
    `);
    console.log('✓ Updated MatchesPlayed for existing records');

    console.log('\n✅ Successfully added all columns to TEAMSTATS table');
    console.log('Note: GoalsFor, GoalsAgainst, and GoalDifference need to be calculated from match results');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    process.exit(1);
  }
}

addTeamStatsColumns();
