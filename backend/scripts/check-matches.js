const db = require('../config/database');

async function checkMatches() {
  try {
    console.log('Checking recent matches...\n');
    
    const [matches] = await db.query(`
      SELECT 
        m.MatchID,
        m.RefereeID,
        m.VenueID,
        r.RefereeName,
        v.VenueName
      FROM \`MATCH\` m
      LEFT JOIN REFEREE r ON m.RefereeID = r.RefereeID
      LEFT JOIN VENUE v ON m.VenueID = v.VenueID
      ORDER BY m.MatchID DESC
      LIMIT 5
    `);
    
    console.log('Recent Matches:');
    matches.forEach(m => {
      console.log(`\nMatch ID: ${m.MatchID}`);
      console.log(`  RefereeID: ${m.RefereeID || 'NULL'}`);
      console.log(`  RefereeName: ${m.RefereeName || 'NOT FOUND'}`);
      console.log(`  VenueID: ${m.VenueID || 'NULL'}`);
      console.log(`  VenueName: ${m.VenueName || 'NOT FOUND'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMatches();
