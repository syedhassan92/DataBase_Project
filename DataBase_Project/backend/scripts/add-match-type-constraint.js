const pool = require('../config/database');

async function addMatchTypeConstraint() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding constraint: Match must be either League OR Tournament...\n');
    
    // First check existing matches for violations
    const [violations] = await connection.query(`
      SELECT MatchID, LeagueID, TournamentID, Status
      FROM \`MATCH\`
      WHERE (LeagueID IS NULL AND TournamentID IS NULL)
         OR (LeagueID IS NOT NULL AND TournamentID IS NOT NULL)
    `);
    
    if (violations.length > 0) {
      console.log(`⚠️  Found ${violations.length} matches that violate the constraint:\n`);
      violations.forEach(m => {
        console.log(`  MatchID ${m.MatchID}: LeagueID=${m.LeagueID}, TournamentID=${m.TournamentID}, Status=${m.Status}`);
      });
      console.log('\n❌ Cannot add constraint until these matches are fixed.');
      console.log('Please update these matches to have either LeagueID OR TournamentID (not both, not neither).\n');
      process.exit(1);
    }
    
    console.log('✓ All matches comply with the constraint\n');
    
    // Add the constraint
    console.log('Adding CHECK constraint to MATCH table...');
    await connection.query(`
      ALTER TABLE \`MATCH\`
      ADD CONSTRAINT chk_match_league_or_tournament
      CHECK ((LeagueID IS NOT NULL AND TournamentID IS NULL) OR (LeagueID IS NULL AND TournamentID IS NOT NULL))
    `);
    
    console.log('✓ Constraint added successfully\n');
    
    // Verify
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME, CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = 'sports_management_db'
      AND TABLE_NAME = 'MATCH'
      AND CONSTRAINT_NAME = 'chk_match_league_or_tournament'
    `);
    
    if (constraints.length > 0) {
      console.log('✅ Constraint verification:');
      console.log(`  Name: ${constraints[0].CONSTRAINT_NAME}`);
      console.log(`  Rule: ${constraints[0].CHECK_CLAUSE}\n`);
    }
    
    console.log('📝 Note: All future matches MUST have either LeagueID OR TournamentID (exclusively).');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

addMatchTypeConstraint()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
