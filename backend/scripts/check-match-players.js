const pool = require('../config/database.js');

async function checkMatchAndPlayers() {
  try {
    // Get latest match
    const [matches] = await pool.query(`
      SELECT 
        m.MatchID, 
        m.Team1ID,
        m.Team2ID,
        m.Team1Score, 
        m.Team2Score, 
        t1.TeamName as Team1, 
        t2.TeamName as Team2 
      FROM \`match\` m 
      JOIN team t1 ON m.Team1ID = t1.TeamID 
      JOIN team t2 ON m.Team2ID = t2.TeamID 
      ORDER BY m.MatchID DESC 
      LIMIT 1
    `);
    
    console.log('Latest Match:');
    console.log(JSON.stringify(matches[0], null, 2));
    
    if (matches.length > 0) {
      console.log('\n--- All Carlos Hernandez ---');
      const [carlos] = await pool.query(`
        SELECT p.PlayerID, p.PlayerName, t.TeamID, t.TeamName 
        FROM player p 
        JOIN playerteam pt ON p.PlayerID = pt.PlayerID 
        JOIN team t ON pt.TeamID = t.TeamID 
        WHERE pt.IsCurrent = 1 AND p.PlayerName = 'Carlos Hernandez'
        ORDER BY t.TeamName
      `);
      console.log(JSON.stringify(carlos, null, 2));
      
      console.log('\n--- All Thomas Davis ---');
      const [thomas] = await pool.query(`
        SELECT p.PlayerID, p.PlayerName, t.TeamID, t.TeamName 
        FROM player p 
        JOIN playerteam pt ON p.PlayerID = pt.PlayerID 
        JOIN team t ON pt.TeamID = t.TeamID 
        WHERE pt.IsCurrent = 1 AND p.PlayerName = 'Thomas Davis'
        ORDER BY t.TeamName
      `);
      console.log(JSON.stringify(thomas, null, 2));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkMatchAndPlayers();
