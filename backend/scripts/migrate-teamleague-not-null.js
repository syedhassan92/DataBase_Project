const db = require('../config/database');

async function migrateTeamLeagueNotNull() {
  try {
    console.log('Starting migration: Make LeagueID and CoachID NOT NULL in TEAMLEAGUE...');

    // First, check if there are any NULL values
    const [nullLeagues] = await db.query(
      'SELECT COUNT(*) as count FROM TEAMLEAGUE WHERE LeagueID IS NULL'
    );
    const [nullCoaches] = await db.query(
      'SELECT COUNT(*) as count FROM TEAMLEAGUE WHERE CoachID IS NULL'
    );

    console.log(`Found ${nullLeagues[0].count} rows with NULL LeagueID`);
    console.log(`Found ${nullCoaches[0].count} rows with NULL CoachID`);

    // Delete rows with NULL values (or you could assign default values)
    if (nullLeagues[0].count > 0) {
      await db.query('DELETE FROM TEAMLEAGUE WHERE LeagueID IS NULL');
      console.log('Deleted rows with NULL LeagueID');
    }

    if (nullCoaches[0].count > 0) {
      await db.query('DELETE FROM TEAMLEAGUE WHERE CoachID IS NULL');
      console.log('Deleted rows with NULL CoachID');
    }

    // Drop the foreign key constraint first
    await db.query('ALTER TABLE TEAMLEAGUE DROP FOREIGN KEY TEAMLEAGUE_ibfk_3');
    console.log('✓ Dropped CoachID foreign key constraint');

    // Modify the table to make columns NOT NULL
    await db.query(`
      ALTER TABLE TEAMLEAGUE 
      MODIFY COLUMN LeagueID INT NOT NULL,
      MODIFY COLUMN CoachID INT NOT NULL
    `);
    console.log('✓ Successfully modified TEAMLEAGUE columns to NOT NULL');

    // Add back the foreign key constraint with CASCADE
    await db.query(`
      ALTER TABLE TEAMLEAGUE 
      ADD CONSTRAINT TEAMLEAGUE_ibfk_3 
      FOREIGN KEY (CoachID) REFERENCES COACH(CoachID) ON DELETE CASCADE
    `);
    console.log('✓ Added CoachID foreign key constraint with CASCADE');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateTeamLeagueNotNull();
