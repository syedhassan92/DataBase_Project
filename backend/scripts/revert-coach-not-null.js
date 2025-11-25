const db = require('../config/database');

async function revertCoachNotNull() {
  try {
    console.log('Reverting CoachID to allow NULL in TEAMLEAGUE...');

    // Drop the foreign key constraint
    await db.query('ALTER TABLE TEAMLEAGUE DROP FOREIGN KEY TEAMLEAGUE_ibfk_3');
    console.log('✓ Dropped CoachID foreign key constraint');

    // Modify the column to allow NULL
    await db.query('ALTER TABLE TEAMLEAGUE MODIFY COLUMN CoachID INT NULL');
    console.log('✓ Modified CoachID to allow NULL');

    // Add back the foreign key constraint with SET NULL
    await db.query(`
      ALTER TABLE TEAMLEAGUE 
      ADD CONSTRAINT TEAMLEAGUE_ibfk_3 
      FOREIGN KEY (CoachID) REFERENCES COACH(CoachID) ON DELETE SET NULL
    `);
    console.log('✓ Added CoachID foreign key constraint with SET NULL');

    console.log('Revert completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Revert failed:', error);
    process.exit(1);
  }
}

revertCoachNotNull();
