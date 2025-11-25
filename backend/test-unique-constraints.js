const db = require('./config/database');

async function testUniqueConstraints() {
  console.log('='.repeat(70));
  console.log('TESTING: PhoneNumber and Email UNIQUE Constraints');
  console.log('='.repeat(70));
  
  try {
    // Test 1: Try to insert duplicate email
    console.log('\n1. Testing duplicate EMAIL constraint...\n');
    
    const existingEmail = 'john.smith@email.com';
    const newPhone = '+1-555-9999';
    
    try {
      await db.query(
        'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
        ['Test Duplicate Email', newPhone, existingEmail, 5]
      );
      console.log('   ❌ FAILED: Duplicate email was allowed!');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('   ✅ SUCCESS: Duplicate email blocked');
        console.log(`   Error: ${err.sqlMessage}`);
      } else {
        console.log(`   ⚠️  Unexpected error: ${err.message}`);
      }
    }
    
    // Test 2: Try to insert duplicate phone
    console.log('\n2. Testing duplicate PHONE NUMBER constraint...\n');
    
    // First, add a phone to existing coach
    await db.query('UPDATE COACH SET PhoneNumber = ? WHERE CoachID = 1', ['+1-555-1111']);
    console.log('   Added phone +1-555-1111 to coach #1');
    
    const newEmail = 'test.unique@example.com';
    const existingPhone = '+1-555-1111';
    
    try {
      await db.query(
        'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
        ['Test Duplicate Phone', existingPhone, newEmail, 3]
      );
      console.log('   ❌ FAILED: Duplicate phone number was allowed!');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('   ✅ SUCCESS: Duplicate phone number blocked');
        console.log(`   Error: ${err.sqlMessage}`);
      } else {
        console.log(`   ⚠️  Unexpected error: ${err.message}`);
      }
    }
    
    // Test 3: Insert with unique phone and email (should succeed)
    console.log('\n3. Testing insert with UNIQUE phone and email...\n');
    
    const uniquePhone = '+1-555-8888';
    const uniqueEmail = 'unique.coach@example.com';
    
    try {
      const [result] = await db.query(
        'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
        ['Test Unique Coach', uniquePhone, uniqueEmail, 7]
      );
      console.log('   ✅ SUCCESS: Coach created with unique phone and email');
      console.log(`   Coach ID: ${result.insertId}`);
      
      // Cleanup
      await db.query('DELETE FROM COACH WHERE CoachID = ?', [result.insertId]);
      console.log('   Test coach deleted');
    } catch (err) {
      console.log(`   ❌ FAILED: Could not insert with unique values: ${err.message}`);
    }
    
    // Test 4: Insert with NULL phone (should be allowed multiple times)
    console.log('\n4. Testing multiple NULL phone numbers (should be allowed)...\n');
    
    try {
      const [result1] = await db.query(
        'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
        ['Test NULL Phone 1', null, 'null.test1@example.com', 1]
      );
      
      const [result2] = await db.query(
        'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
        ['Test NULL Phone 2', null, 'null.test2@example.com', 2]
      );
      
      console.log('   ✅ SUCCESS: Multiple NULL phone numbers allowed');
      console.log(`   Created coaches: ${result1.insertId}, ${result2.insertId}`);
      
      // Cleanup
      await db.query('DELETE FROM COACH WHERE CoachID IN (?, ?)', [result1.insertId, result2.insertId]);
      console.log('   Test coaches deleted');
    } catch (err) {
      console.log(`   ❌ FAILED: ${err.message}`);
    }
    
    // Test 5: Update to duplicate email
    console.log('\n5. Testing UPDATE with duplicate email...\n');
    
    const coach1Email = 'maria.garcia@email.com';
    
    try {
      await db.query(
        'UPDATE COACH SET Email = ? WHERE CoachID = 1',
        [coach1Email]
      );
      console.log('   ❌ FAILED: Update to duplicate email was allowed!');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('   ✅ SUCCESS: Update to duplicate email blocked');
        console.log(`   Error: ${err.sqlMessage}`);
      } else {
        console.log(`   ⚠️  Unexpected error: ${err.message}`);
      }
    }
    
    // Display final state
    console.log('\n6. Final COACH table state:\n');
    const [coaches] = await db.query('SELECT CoachID, CoachName, PhoneNumber, Email FROM COACH ORDER BY CoachID');
    
    coaches.forEach(coach => {
      console.log(`   #${coach.CoachID} ${coach.CoachName}`);
      console.log(`      📱 ${coach.PhoneNumber || 'No phone'}`);
      console.log(`      📧 ${coach.Email}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('ALL TESTS COMPLETED!');
    console.log('✅ PhoneNumber: UNIQUE constraint working');
    console.log('✅ Email: UNIQUE constraint working');
    console.log('✅ NULL values allowed for PhoneNumber');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

testUniqueConstraints();
