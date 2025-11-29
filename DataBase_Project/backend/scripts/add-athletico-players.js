const db = require('../config/database');

async function addAthleticoPlayers() {
  try {
    console.log('Adding 11 players to Athletico Madrid...\n');

    // Get Athletico Madrid team ID
    const [teams] = await db.query('SELECT TeamID, TeamName FROM TEAM WHERE TeamName = ?', ['Athletico Madrid']);
    
    if (teams.length === 0) {
      console.log('❌ Athletico Madrid not found');
      process.exit(1);
    }

    const teamId = teams[0].TeamID;
    console.log(`✓ Found ${teams[0].TeamName} (ID: ${teamId})\n`);

    // Player data for Athletico Madrid
    const players = [
      { name: 'Jan Oblak', role: 'Goalkeeper' },
      { name: 'Stefan Savic', role: 'Defender' },
      { name: 'Jose Gimenez', role: 'Defender' },
      { name: 'Mario Hermoso', role: 'Defender' },
      { name: 'Nahuel Molina', role: 'Defender' },
      { name: 'Koke', role: 'Midfielder' },
      { name: 'Rodrigo De Paul', role: 'Midfielder' },
      { name: 'Saul Niguez', role: 'Midfielder' },
      { name: 'Marcos Llorente', role: 'Midfielder' },
      { name: 'Antoine Griezmann', role: 'Forward' },
      { name: 'Alvaro Morata', role: 'Forward' }
    ];

    console.log('Adding players...');
    
    for (const player of players) {
      // Insert player
      const [result] = await db.query(
        'INSERT INTO PLAYER (PlayerName, PlayerRole) VALUES (?, ?)',
        [player.name, player.role]
      );
      
      const playerId = result.insertId;
      
      // Assign to team
      await db.query(
        'INSERT INTO PLAYERTEAM (PlayerID, TeamID, IsCurrent, StartDate) VALUES (?, ?, TRUE, CURDATE())',
        [playerId, teamId]
      );
      
      console.log(`  ✓ ${player.name} (${player.role})`);
    }

    // Verify player count
    const [playerCount] = await db.query(
      'SELECT COUNT(*) as count FROM PLAYERTEAM WHERE TeamID = ? AND IsCurrent = TRUE',
      [teamId]
    );

    console.log(`\n✅ Successfully added ${players.length} players to Athletico Madrid!`);
    console.log(`   Total current players: ${playerCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAthleticoPlayers();
