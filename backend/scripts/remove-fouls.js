const db = require('../config/database');

async function removeFoulsColumn() {
  try {
    console.log('Removing Fouls column from MATCHSTATS table...\n');

    // Check if column exists before attempting to drop it
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sports_management_db' 
        AND TABLE_NAME = 'MATCHSTATS' 
        AND COLUMN_NAME = 'Fouls'
    `);

    if (columns.length > 0) {
      // Drop the Fouls column
      await db.query('ALTER TABLE MATCHSTATS DROP COLUMN Fouls');
      console.log('✓ Removed Fouls column from MATCHSTATS table');
    } else {
      console.log('✓ Fouls column does not exist (already removed)');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing Fouls column:', error.message);
    process.exit(1);
  }
}

removeFoulsColumn();
