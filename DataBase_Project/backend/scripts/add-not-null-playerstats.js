const pool = require('../config/database');

async function applyNotNullConstraints() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting NOT NULL constraint migration for PLAYERSTATS...\n');
    
    // First, check for NULL values
    const [nullMatches] = await connection.query(`
      SELECT COUNT(*) as count FROM PLAYERSTATS WHERE MatchID IS NULL
    `);
    
    const [nullLeagues] = await connection.query(`
      SELECT COUNT(*) as count FROM PLAYERSTATS WHERE LeagueID IS NULL
    `);
    
    console.log(`Records with NULL MatchID: ${nullMatches[0].count}`);
    console.log(`Records with NULL LeagueID: ${nullLeagues[0].count}\n`);
    
    if (nullMatches[0].count > 0 || nullLeagues[0].count > 0) {
      console.log('⚠️  WARNING: Found records with NULL values.');
      console.log('These are old aggregate stats that need to be handled.\n');
      
      console.log('Options:');
      console.log('1. Delete these old records (recommended for clean data)');
      console.log('2. Keep them and skip constraint (not recommended)\n');
      
      // For now, let's delete the NULL records as they're legacy data
      console.log('Deleting records with NULL MatchID or LeagueID...');
      
      const [deleteResult] = await connection.query(`
        DELETE FROM PLAYERSTATS 
        WHERE MatchID IS NULL OR LeagueID IS NULL
      `);
      
      console.log(`✓ Deleted ${deleteResult.affectedRows} legacy records\n`);
    }
    
    // Now apply the NOT NULL constraints
    console.log('Applying NOT NULL constraint to MatchID...');
    await connection.query(`
      ALTER TABLE PLAYERSTATS 
      MODIFY COLUMN MatchID INT NOT NULL
    `);
    console.log('✓ MatchID is now NOT NULL\n');
    
    console.log('Applying NOT NULL constraint to LeagueID...');
    await connection.query(`
      ALTER TABLE PLAYERSTATS 
      MODIFY COLUMN LeagueID INT NOT NULL
    `);
    console.log('✓ LeagueID is now NOT NULL\n');
    
    // Verify the changes
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'sports_management_db'
      AND TABLE_NAME = 'playerstats'
      AND COLUMN_NAME IN ('MatchID', 'LeagueID')
    `);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('Updated column definitions:');
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} - NULL allowed: ${col.IS_NULLABLE}`);
    });
    
    console.log('\n📝 Note: All future player stats MUST include MatchID and LeagueID.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

applyNotNullConstraints()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
