const db = require('../config/database');

async function populateRefereesAndMatches() {
  try {
    console.log('Populating referees and scheduling matches...\n');

    // Step 1: Add referees
    console.log('📋 Adding referees...');
    const referees = [
      { name: 'Michael Oliver', phone: '+44-123-456-7890', email: 'michael.oliver@referees.com' },
      { name: 'Anthony Taylor', phone: '+44-123-456-7891', email: 'anthony.taylor@referees.com' },
      { name: 'Stuart Attwell', phone: '+44-123-456-7892', email: 'stuart.attwell@referees.com' },
      { name: 'Paul Tierney', phone: '+44-123-456-7893', email: 'paul.tierney@referees.com' },
      { name: 'Simon Hooper', phone: '+44-123-456-7894', email: 'simon.hooper@referees.com' },
      { name: 'Craig Pawson', phone: '+44-123-456-7895', email: 'craig.pawson@referees.com' },
      { name: 'Chris Kavanagh', phone: '+44-123-456-7896', email: 'chris.kavanagh@referees.com' },
      { name: 'Andre Marriner', phone: '+44-123-456-7897', email: 'andre.marriner@referees.com' }
    ];

    for (const referee of referees) {
      await db.query(
        'INSERT INTO REFEREE (RefereeName, PhoneNumber, Email, AvailabilityStatus) VALUES (?, ?, ?, ?)',
        [referee.name, referee.phone, referee.email, 'Available']
      );
    }
    console.log(`✓ Added ${referees.length} referees\n`);

    // Step 2: Get league and team data
    const [leagues] = await db.query('SELECT LeagueID, LeagueName, StartDate FROM LEAGUE ORDER BY LeagueID LIMIT 1');
    if (leagues.length === 0) {
      console.log('❌ No league found. Please create a league first.');
      process.exit(1);
    }

    const league = leagues[0];
    console.log(`🏆 Using league: ${league.LeagueName} (ID: ${league.LeagueID})`);

    // Get teams in this league
    const [teamLeagues] = await db.query(`
      SELECT tl.TeamID, t.TeamName, tl.CoachID
      FROM TEAMLEAGUE tl
      JOIN TEAM t ON tl.TeamID = t.TeamID
      WHERE tl.LeagueID = ?
    `, [league.LeagueID]);

    if (teamLeagues.length < 2) {
      console.log('❌ Need at least 2 teams in the league to schedule matches.');
      process.exit(1);
    }

    console.log(`✓ Found ${teamLeagues.length} teams in the league\n`);

    // Get venues
    const [venues] = await db.query('SELECT VenueID, VenueName FROM VENUE WHERE IsAvailable = TRUE');
    if (venues.length === 0) {
      console.log('❌ No available venues found. Please add venues first.');
      process.exit(1);
    }

    // Get referees
    const [allReferees] = await db.query('SELECT RefereeID, RefereeName FROM REFEREE WHERE AvailabilityStatus = "Available"');
    console.log(`✓ Found ${allReferees.length} available referees\n`);

    // Step 3: Schedule matches
    console.log('📅 Scheduling matches...');
    
    let matchCount = 0;
    let currentDate = new Date(league.StartDate || new Date());
    const teams = teamLeagues;
    
    // Create a round-robin schedule (each team plays each other once)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];
        
        // Alternate match times
        const matchTimes = ['15:00:00', '17:30:00', '20:00:00'];
        const matchTime = matchTimes[matchCount % matchTimes.length];
        
        // Select venue and referee (rotate through available ones)
        const venue = venues[matchCount % venues.length];
        const referee = allReferees[matchCount % allReferees.length];
        
        await db.query(`
          INSERT INTO \`MATCH\` 
          (LeagueID, Team1ID, Team2ID, VenueID, RefereeID, MatchDate, MatchTime, Status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          league.LeagueID,
          team1.TeamID,
          team2.TeamID,
          venue.VenueID,
          referee.RefereeID,
          currentDate.toISOString().split('T')[0],
          matchTime,
          'Scheduled'
        ]);
        
        console.log(`  ✓ ${team1.TeamName} vs ${team2.TeamName} - ${currentDate.toISOString().split('T')[0]} ${matchTime} at ${venue.VenueName}`);
        
        matchCount++;
        
        // Move to next match day (every 3-4 days)
        if (matchCount % 2 === 0) {
          currentDate.setDate(currentDate.getDate() + 3);
        }
      }
    }

    console.log(`\n✅ Successfully scheduled ${matchCount} matches!`);
    console.log('\nSummary:');
    console.log(`  • Referees added: ${referees.length}`);
    console.log(`  • Matches scheduled: ${matchCount}`);
    console.log(`  • League: ${league.LeagueName}`);
    console.log(`  • Teams: ${teams.length}`);
    console.log(`  • Venues used: ${venues.length}`);
    console.log(`  • Referees assigned: ${allReferees.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

populateRefereesAndMatches();
