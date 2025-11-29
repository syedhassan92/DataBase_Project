const pool = require('../config/database.js');

async function checkAllConstraints() {
  try {
    console.log('Checking all constraint violations...\n');

    // Check duplicate coach phone numbers
    const [coachPhoneDupes] = await pool.query(
      'SELECT PhoneNumber, COUNT(*) as count FROM coach WHERE PhoneNumber IS NOT NULL GROUP BY PhoneNumber HAVING count > 1'
    );
    console.log('1. Duplicate coach phone numbers:', coachPhoneDupes.length > 0 ? coachPhoneDupes : 'None');

    // Check duplicate coach emails
    const [coachEmailDupes] = await pool.query(
      'SELECT Email, COUNT(*) as count FROM coach WHERE Email IS NOT NULL GROUP BY Email HAVING count > 1'
    );
    console.log('2. Duplicate coach emails:', coachEmailDupes.length > 0 ? coachEmailDupes : 'None');

    // Check duplicate referee phone numbers
    const [refPhoneDupes] = await pool.query(
      'SELECT PhoneNumber, COUNT(*) as count FROM referee WHERE PhoneNumber IS NOT NULL GROUP BY PhoneNumber HAVING count > 1'
    );
    console.log('3. Duplicate referee phone numbers:', refPhoneDupes.length > 0 ? refPhoneDupes : 'None');

    // Check duplicate referee emails
    const [refEmailDupes] = await pool.query(
      'SELECT Email, COUNT(*) as count FROM referee WHERE Email IS NOT NULL GROUP BY Email HAVING count > 1'
    );
    console.log('4. Duplicate referee emails:', refEmailDupes.length > 0 ? refEmailDupes : 'None');

    // Check players in multiple teams
    const [playerDupes] = await pool.query(
      'SELECT PlayerID, COUNT(*) as team_count FROM playerteam WHERE IsCurrent = 1 GROUP BY PlayerID HAVING team_count > 1'
    );
    console.log('5. Players in multiple teams:', playerDupes.length > 0 ? playerDupes : 'None');

    // Check coaches with multiple teams
    const [coachMultiTeams] = await pool.query(
      'SELECT CoachID, COUNT(*) as team_count FROM teamleague WHERE CoachID IS NOT NULL GROUP BY CoachID HAVING team_count > 1'
    );
    console.log('6. Coaches with multiple teams:', coachMultiTeams.length > 0 ? coachMultiTeams : 'None');

    // Check matches where team plays itself
    const [selfMatches] = await pool.query(
      'SELECT MatchID, Team1ID, Team2ID FROM `match` WHERE Team1ID = Team2ID'
    );
    console.log('7. Matches where team plays itself:', selfMatches.length > 0 ? selfMatches : 'None');

    // Check teams with multiple matches on same day
    const [teamMultiMatchesPerDay] = await pool.query(`
      SELECT m1.MatchID as Match1, m2.MatchID as Match2, m1.Team1ID, m1.MatchDate 
      FROM \`match\` m1 
      JOIN \`match\` m2 ON (
        (m1.Team1ID = m2.Team1ID OR m1.Team1ID = m2.Team2ID OR m1.Team2ID = m2.Team1ID OR m1.Team2ID = m2.Team2ID)
        AND m1.MatchDate = m2.MatchDate 
        AND m1.MatchID < m2.MatchID
        AND m1.Status != 'Cancelled' 
        AND m2.Status != 'Cancelled'
      )
    `);
    console.log('8. Teams with multiple matches on same day:', teamMultiMatchesPerDay.length > 0 ? teamMultiMatchesPerDay : 'None');

    console.log('\n✓ Constraint check complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkAllConstraints();
