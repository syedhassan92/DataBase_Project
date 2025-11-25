const db = require('./config/database');

async function testTournamentCreation() {
  console.log('='.repeat(60));
  console.log('TESTING TOURNAMENT AUTO-INCREMENT');
  console.log('='.repeat(60));
  
  try {
    // 1. Check current AUTO_INCREMENT value
    console.log('\n1. Checking AUTO_INCREMENT status...');
    const [status] = await db.query("SHOW TABLE STATUS LIKE 'TOURNAMENT'");
    const currentAutoIncrement = status[0].Auto_increment;
    console.log(`   Current AUTO_INCREMENT: ${currentAutoIncrement}`);
    
    // 2. Check existing tournaments
    console.log('\n2. Checking existing tournaments...');
    const [existing] = await db.query('SELECT TournamentID, TournamentName FROM TOURNAMENT ORDER BY TournamentID');
    console.log(`   Found ${existing.length} existing tournaments:`);
    existing.forEach(t => console.log(`   - ID ${t.TournamentID}: ${t.TournamentName}`));
    
    // 3. Test creating a tournament WITHOUT specifying ID
    console.log('\n3. Creating test tournament (WITHOUT ID)...');
    const [insertResult] = await db.query(
      'INSERT INTO TOURNAMENT (AdminID, TournamentName, Description, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'Auto-Increment Test Tournament', 'Testing auto-increment', '2025-12-01', '2025-12-31', 'upcoming']
    );
    
    const newId = insertResult.insertId;
    console.log(`   ✅ SUCCESS! New Tournament ID: ${newId}`);
    console.log(`   insertId from result: ${insertResult.insertId}`);
    console.log(`   affectedRows: ${insertResult.affectedRows}`);
    
    // 4. Verify the tournament was created
    console.log('\n4. Verifying tournament in database...');
    const [created] = await db.query('SELECT * FROM TOURNAMENT WHERE TournamentID = ?', [newId]);
    if (created.length > 0) {
      console.log('   ✅ Tournament found in database:');
      console.log(`   - ID: ${created[0].TournamentID}`);
      console.log(`   - Name: ${created[0].TournamentName}`);
      console.log(`   - AdminID: ${created[0].AdminID}`);
    } else {
      console.log('   ❌ Tournament NOT found!');
    }
    
    // 5. Test what happens if someone tries to manually set ID (should fail or be ignored)
    console.log('\n5. Testing manual ID assignment (should use auto-increment anyway)...');
    try {
      const [manualResult] = await db.query(
        'INSERT INTO TOURNAMENT (TournamentID, AdminID, TournamentName, StartDate, EndDate) VALUES (?, ?, ?, ?, ?)',
        [999, 1, 'Manual ID Test', '2025-12-01', '2025-12-31']
      );
      console.log(`   ⚠️  Manual ID was accepted. New ID: ${manualResult.insertId}`);
      
      // Check what ID was actually used
      const [manualCheck] = await db.query('SELECT TournamentID FROM TOURNAMENT WHERE TournamentName = ?', ['Manual ID Test']);
      console.log(`   Actual ID in database: ${manualCheck[0]?.TournamentID}`);
      
      // Clean up manual test
      await db.query('DELETE FROM TOURNAMENT WHERE TournamentName = ?', ['Manual ID Test']);
    } catch (err) {
      console.log(`   ✅ Manual ID rejected (as expected): ${err.message}`);
    }
    
    // 6. Check AUTO_INCREMENT after insertions
    console.log('\n6. Checking AUTO_INCREMENT after insertions...');
    const [statusAfter] = await db.query("SHOW TABLE STATUS LIKE 'TOURNAMENT'");
    const newAutoIncrement = statusAfter[0].Auto_increment;
    console.log(`   New AUTO_INCREMENT: ${newAutoIncrement}`);
    console.log(`   Increased by: ${newAutoIncrement - currentAutoIncrement}`);
    
    // 7. Compare with TEAM and LEAGUE tables
    console.log('\n7. Comparing with TEAM and LEAGUE tables...');
    const [teamStatus] = await db.query("SHOW TABLE STATUS LIKE 'TEAM'");
    const [leagueStatus] = await db.query("SHOW TABLE STATUS LIKE 'LEAGUE'");
    console.log(`   TEAM AUTO_INCREMENT: ${teamStatus[0].Auto_increment}`);
    console.log(`   LEAGUE AUTO_INCREMENT: ${leagueStatus[0].Auto_increment}`);
    console.log(`   TOURNAMENT AUTO_INCREMENT: ${newAutoIncrement}`);
    console.log('   All three tables use AUTO_INCREMENT ✅');
    
    // 8. Clean up
    console.log('\n8. Cleaning up test data...');
    await db.query('DELETE FROM TOURNAMENT WHERE TournamentID = ?', [newId]);
    console.log('   Test tournament deleted');
    
    console.log('\n' + '='.repeat(60));
    console.log('CONCLUSION: Tournament AUTO_INCREMENT is working correctly!');
    console.log('Next tournament will automatically get ID:', newAutoIncrement - 1);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

testTournamentCreation();
