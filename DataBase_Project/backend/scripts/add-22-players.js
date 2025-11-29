const db = require('../config/database');

async function addPlayers() {
  try {
    console.log('Fetching teams from database...');
    
    // Get existing teams
    const [teams] = await db.query('SELECT TeamID, TeamName FROM TEAM LIMIT 5');
    
    if (teams.length === 0) {
      console.log('No teams found. Please create teams first.');
      process.exit(1);
    }
    
    console.log(`Found ${teams.length} teams:`);
    teams.forEach(t => console.log(`  - ${t.TeamName} (ID: ${t.TeamID})`));
    
    // Create 22 players with various roles
    const players = [
      // Team 1 - 11 players
      { name: 'David Martinez', role: 'Goalkeeper', teamId: teams[0]?.TeamID },
      { name: 'Marcus Johnson', role: 'Defender', teamId: teams[0]?.TeamID },
      { name: 'Ryan Anderson', role: 'Defender', teamId: teams[0]?.TeamID },
      { name: 'Lucas Thompson', role: 'Defender', teamId: teams[0]?.TeamID },
      { name: 'James Wilson', role: 'Defender', teamId: teams[0]?.TeamID },
      { name: 'Oliver Smith', role: 'Midfielder', teamId: teams[0]?.TeamID },
      { name: 'Alexander Brown', role: 'Midfielder', teamId: teams[0]?.TeamID },
      { name: 'Daniel Taylor', role: 'Midfielder', teamId: teams[0]?.TeamID },
      { name: 'William Davis', role: 'Forward', teamId: teams[0]?.TeamID },
      { name: 'Michael Clark', role: 'Forward', teamId: teams[0]?.TeamID },
      { name: 'Robert Lee', role: 'Forward', teamId: teams[0]?.TeamID },
      
      // Team 2 - 11 players
      { name: 'Carlos Rodriguez', role: 'Goalkeeper', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Diego Silva', role: 'Defender', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Luis Fernandez', role: 'Defender', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Pablo Garcia', role: 'Defender', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Antonio Martinez', role: 'Defender', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Juan Hernandez', role: 'Midfielder', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Miguel Lopez', role: 'Midfielder', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Pedro Gonzalez', role: 'Midfielder', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Sergio Ramirez', role: 'Forward', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Fernando Torres', role: 'Forward', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
      { name: 'Javier Morales', role: 'Forward', teamId: teams[1]?.TeamID || teams[0]?.TeamID },
    ];
    
    console.log('\nInserting 22 players...');
    
    for (const player of players) {
      // First, insert into PLAYER table
      const [playerResult] = await db.query(
        'INSERT INTO PLAYER (PlayerName, PlayerRole) VALUES (?, ?)',
        [player.name, player.role]
      );
      
      const playerId = playerResult.insertId;
      
      // Then, create the player-team association in PLAYERTEAM table
      await db.query(
        'INSERT INTO PLAYERTEAM (PlayerID, TeamID, StartDate, IsCurrent) VALUES (?, ?, CURDATE(), TRUE)',
        [playerId, player.teamId]
      );
      
      const team = teams.find(t => t.TeamID === player.teamId);
      console.log(`✓ Added ${player.name} (${player.role}) to ${team?.TeamName || 'Team ' + player.teamId}`);
    }
    
    console.log('\n✅ Successfully added 22 players with team assignments!');
    
    // Show summary
    const [playerCount] = await db.query('SELECT COUNT(*) as count FROM PLAYER');
    console.log(`\nTotal players in database: ${playerCount[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding players:', error.message);
    process.exit(1);
  }
}

addPlayers();
