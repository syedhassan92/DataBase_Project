const mysql = require('mysql2/promise');

async function assignPlayersToTeams() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sports_management_db'
  });

  try {
    // Get all teams
    const [teams] = await connection.execute('SELECT TeamID, TeamName FROM TEAM ORDER BY TeamID');
    
    console.log(`Found ${teams.length} teams in the database\n`);
    
    // Player positions and typical distribution for a football/soccer team
    const positions = [
      { role: 'Goalkeeper', count: 1 },
      { role: 'Defender', count: 4 },
      { role: 'Midfielder', count: 4 },
      { role: 'Forward', count: 2 }
    ];
    
    // First names and last names for generating player names
    const firstNames = [
      'James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph',
      'Thomas', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew',
      'Paul', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald',
      'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Nicholas', 'Eric', 'Jonathan',
      'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Raymond',
      'Patrick', 'Alexander', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose',
      'Adam', 'Nathan', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter', 'Ethan',
      'Jeremy', 'Harold', 'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
      'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
      'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
      'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
      'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy'
    ];

    let totalPlayersAdded = 0;
    
    for (const team of teams) {
      // Check how many current players this team already has
      const [currentPlayers] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM PLAYERTEAM 
        WHERE TeamID = ? AND IsCurrent = TRUE
      `, [team.TeamID]);
      
      const existingCount = currentPlayers[0].count;
      const playersNeeded = 11 - existingCount;
      
      if (playersNeeded <= 0) {
        console.log(`${team.TeamName}: Already has ${existingCount} players. Skipping.`);
        continue;
      }
      
      console.log(`${team.TeamName}: Has ${existingCount} players, adding ${playersNeeded} more...`);
      
      let playersAddedToTeam = 0;
      
      // Add players based on position distribution
      for (const position of positions) {
        const countToAdd = Math.min(position.count, playersNeeded - playersAddedToTeam);
        
        for (let i = 0; i < countToAdd; i++) {
          // Generate unique player name
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const playerName = `${firstName} ${lastName}`;
          
          // Generate random stats
          const age = Math.floor(Math.random() * 15) + 18; // Age between 18-32
          const rating = (Math.random() * 30 + 70).toFixed(1); // Rating between 70-100
          
          // Insert player
          const [playerResult] = await connection.execute(`
            INSERT INTO PLAYER (PlayerName, PlayerRole, DateOfBirth, Nationality)
            VALUES (?, ?, DATE_SUB(CURDATE(), INTERVAL ? YEAR), 'Unknown')
          `, [playerName, position.role, age]);
          
          const playerId = playerResult.insertId;
          
          // Assign to team
          await connection.execute(`
            INSERT INTO PLAYERTEAM (PlayerID, TeamID, ContractDetails, StartDate, IsCurrent)
            VALUES (?, ?, ?, CURDATE(), TRUE)
          `, [playerId, team.TeamID, `Contract with ${team.TeamName}`]);
          
          // Initialize player stats
          await connection.execute(`
            INSERT INTO PLAYERSTATS (PlayerID, MatchesPlayed, Wins, GoalsOrRuns, Assists, Rating)
            VALUES (?, 0, 0, 0, 0, ?)
          `, [playerId, rating]);
          
          playersAddedToTeam++;
          totalPlayersAdded++;
        }
        
        if (playersAddedToTeam >= playersNeeded) break;
      }
      
      console.log(`  ✓ Added ${playersAddedToTeam} players to ${team.TeamName}`);
    }
    
    console.log(`\n✓ Total players added: ${totalPlayersAdded}`);
    
    // Verify final counts
    console.log('\nFinal team rosters:');
    for (const team of teams) {
      const [count] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM PLAYERTEAM 
        WHERE TeamID = ? AND IsCurrent = TRUE
      `, [team.TeamID]);
      
      console.log(`  ${team.TeamName}: ${count[0].count} players`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

assignPlayersToTeams()
  .then(() => {
    console.log('\n✓ Player assignment completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
