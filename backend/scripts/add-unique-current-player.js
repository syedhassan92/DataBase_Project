const mysql = require('mysql2/promise');

async function addUniqueCurrentPlayerConstraint() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sports_management_db'
  });

  try {
    console.log('Checking for players with multiple current teams...');
    
    // First, check if there are any violations
    const [violations] = await connection.execute(`
      SELECT PlayerID, COUNT(*) as team_count
      FROM PLAYERTEAM
      WHERE IsCurrent = TRUE
      GROUP BY PlayerID
      HAVING COUNT(*) > 1
    `);
    
    if (violations.length > 0) {
      console.log('\nFound players with multiple current teams:');
      for (const v of violations) {
        console.log(`PlayerID ${v.PlayerID}: ${v.team_count} current teams`);
        
        // Get details
        const [details] = await connection.execute(`
          SELECT pt.PlayerTeamID, pt.PlayerID, pt.TeamID, t.TeamName, pt.StartDate
          FROM PLAYERTEAM pt
          JOIN TEAM t ON pt.TeamID = t.TeamID
          WHERE pt.PlayerID = ? AND pt.IsCurrent = TRUE
          ORDER BY pt.StartDate DESC
        `, [v.PlayerID]);
        
        console.log('Details:', details);
        
        // Keep only the most recent one as current
        if (details.length > 1) {
          const keepCurrent = details[0].PlayerTeamID;
          const makeInactive = details.slice(1).map(d => d.PlayerTeamID);
          
          console.log(`Keeping PlayerTeamID ${keepCurrent} as current`);
          console.log(`Setting PlayerTeamID [${makeInactive.join(', ')}] as inactive`);
          
          for (const id of makeInactive) {
            await connection.execute(`
              UPDATE PLAYERTEAM 
              SET IsCurrent = FALSE, EndDate = CURDATE()
              WHERE PlayerTeamID = ?
            `, [id]);
          }
        }
      }
      console.log('\nFixed duplicate current team assignments.');
    } else {
      console.log('No players with multiple current teams found.');
    }
    
    console.log('\nAdding unique constraint to prevent players from joining multiple teams...');
    
    // Drop the constraint if it exists
    try {
      await connection.execute(`
        ALTER TABLE PLAYERTEAM DROP INDEX unique_current_player
      `);
      console.log('Dropped existing constraint.');
    } catch (err) {
      // Constraint doesn't exist, that's fine
    }
    
    // Add unique constraint for PlayerID where IsCurrent = TRUE
    // Note: MySQL doesn't support partial unique indexes directly, so we'll use a trigger approach
    await connection.execute(`
      CREATE UNIQUE INDEX unique_current_player ON PLAYERTEAM (PlayerID, IsCurrent)
      WHERE IsCurrent = TRUE
    `);
    
    console.log('✓ Unique constraint added successfully!');
    console.log('A player can now only be current in one team at a time.');
    
  } catch (error) {
    // If the WHERE clause syntax doesn't work, use a different approach
    if (error.code === 'ER_PARSE_ERROR') {
      console.log('Using alternative approach with trigger...');
      
      // Drop existing trigger if any
      try {
        await connection.query('DROP TRIGGER IF EXISTS before_playerteam_insert');
        await connection.query('DROP TRIGGER IF EXISTS before_playerteam_update');
      } catch (err) {
        // Ignore
      }
      
      // Create trigger to prevent multiple current teams
      await connection.query(`
        CREATE TRIGGER before_playerteam_insert
        BEFORE INSERT ON PLAYERTEAM
        FOR EACH ROW
        BEGIN
          IF NEW.IsCurrent = TRUE THEN
            IF EXISTS (
              SELECT 1 FROM PLAYERTEAM 
              WHERE PlayerID = NEW.PlayerID 
              AND IsCurrent = TRUE
            ) THEN
              SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Player is already assigned to a current team';
            END IF;
          END IF;
        END
      `);
      
      await connection.query(`
        CREATE TRIGGER before_playerteam_update
        BEFORE UPDATE ON PLAYERTEAM
        FOR EACH ROW
        BEGIN
          IF NEW.IsCurrent = TRUE AND OLD.IsCurrent = FALSE THEN
            IF EXISTS (
              SELECT 1 FROM PLAYERTEAM 
              WHERE PlayerID = NEW.PlayerID 
              AND IsCurrent = TRUE
              AND PlayerTeamID != NEW.PlayerTeamID
            ) THEN
              SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Player is already assigned to a current team';
            END IF;
          END IF;
        END
      `);
      
      console.log('✓ Triggers created successfully!');
      console.log('A player can now only be current in one team at a time.');
    } else {
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addUniqueCurrentPlayerConstraint()
  .then(() => {
    console.log('\nConstraint addition completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
