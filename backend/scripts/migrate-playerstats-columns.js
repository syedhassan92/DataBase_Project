const pool = require('../config/database');

async function migratePlayerStats() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting PLAYERSTATS migration...');
    
    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sports_management_db' 
      AND TABLE_NAME = 'playerstats'
      AND COLUMN_NAME IN ('MatchID', 'LeagueID')
    `);
    
    if (columns.length === 2) {
      console.log('✓ Columns already exist, skipping migration');
      return;
    }
    
    console.log('Adding MatchID and LeagueID columns to PLAYERSTATS...');
    
    // Add MatchID column
    await connection.query(`
      ALTER TABLE PLAYERSTATS 
      ADD COLUMN MatchID INT AFTER PlayerID
    `);
    console.log('✓ Added MatchID column');
    
    // Add LeagueID column
    await connection.query(`
      ALTER TABLE PLAYERSTATS 
      ADD COLUMN LeagueID INT AFTER MatchID
    `);
    console.log('✓ Added LeagueID column');
    
    // Add foreign key constraints
    await connection.query(`
      ALTER TABLE PLAYERSTATS 
      ADD CONSTRAINT fk_playerstats_match 
      FOREIGN KEY (MatchID) REFERENCES \`MATCH\`(MatchID) ON DELETE CASCADE
    `);
    console.log('✓ Added MatchID foreign key constraint');
    
    await connection.query(`
      ALTER TABLE PLAYERSTATS 
      ADD CONSTRAINT fk_playerstats_league 
      FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE
    `);
    console.log('✓ Added LeagueID foreign key constraint');
    
    // Update existing records by deriving LeagueID from player's current team
    const [result] = await connection.query(`
      UPDATE PLAYERSTATS ps
      JOIN PLAYER p ON ps.PlayerID = p.PlayerID
      LEFT JOIN PLAYERTEAM pt ON p.PlayerID = pt.PlayerID AND pt.IsCurrent = 1
      LEFT JOIN TEAMLEAGUE tl ON pt.TeamID = tl.TeamID
      SET ps.LeagueID = tl.LeagueID
      WHERE ps.LeagueID IS NULL AND tl.LeagueID IS NOT NULL
    `);
    console.log(`✓ Updated ${result.affectedRows} existing records with LeagueID`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('Note: MatchID will remain NULL for existing aggregate stats.');
    console.log('New stats created from matches will include MatchID and LeagueID.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

migratePlayerStats()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
