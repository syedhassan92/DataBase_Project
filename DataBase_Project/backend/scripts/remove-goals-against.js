const db = require('../config/database');

async function removeGoalsAgainst() {
  try {
    console.log('Removing GoalsAgainst column from TEAMSTATS table...');

    // Drop the GoalsAgainst column
    await db.query(`
      ALTER TABLE TEAMSTATS 
      DROP COLUMN GoalsAgainst
    `);
    console.log('✓ Removed GoalsAgainst column');

    console.log('\n✅ Successfully removed GoalsAgainst from TEAMSTATS table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing column:', error.message);
    process.exit(1);
  }
}

removeGoalsAgainst();
