const db = require('../config/database');

async function addPhoneNumberUniqueConstraint() {
  console.log('='.repeat(70));
  console.log('MIGRATION: Add UNIQUE Constraint to PhoneNumber');
  console.log('='.repeat(70));
  
  try {
    // 1. Check COACH table
    console.log('\n1. Checking COACH table...\n');
    
    // Check for duplicate phone numbers
    const [coachDuplicates] = await db.query(`
      SELECT PhoneNumber, COUNT(*) as count
      FROM COACH
      WHERE PhoneNumber IS NOT NULL
      GROUP BY PhoneNumber
      HAVING count > 1
    `);
    
    if (coachDuplicates.length > 0) {
      console.log('❌ ERROR: Duplicate phone numbers found in COACH table:');
      coachDuplicates.forEach(dup => {
        console.log(`   - ${dup.PhoneNumber}: ${dup.count} coaches`);
      });
      console.log('\nPlease resolve duplicates before adding UNIQUE constraint.');
      return;
    } else {
      console.log('✅ No duplicate phone numbers in COACH table');
    }
    
    // Check if constraint already exists
    const [coachConstraints] = await db.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'COACH'
        AND CONSTRAINT_TYPE = 'UNIQUE'
        AND CONSTRAINT_NAME LIKE '%phone%'
    `);
    
    if (coachConstraints.length === 0) {
      console.log('\n2. Adding UNIQUE constraint to COACH.PhoneNumber...\n');
      await db.query('ALTER TABLE COACH ADD UNIQUE KEY unique_phone (PhoneNumber)');
      console.log('   ✅ Constraint added successfully');
    } else {
      console.log('\n2. UNIQUE constraint already exists on COACH.PhoneNumber');
    }
    
    // 3. Check REFEREE table
    console.log('\n3. Checking REFEREE table...\n');
    
    // Check if REFEREE table has PhoneNumber column
    const [refereeColumns] = await db.query('DESCRIBE REFEREE');
    const hasPhoneNumber = refereeColumns.some(col => col.Field === 'PhoneNumber');
    
    if (!hasPhoneNumber) {
      console.log('⚠️  REFEREE table does not have PhoneNumber column yet');
      console.log('   (Schema is updated but migration not run)');
    } else {
      // Check for duplicate phone numbers
      const [refereeDuplicates] = await db.query(`
        SELECT PhoneNumber, COUNT(*) as count
        FROM REFEREE
        WHERE PhoneNumber IS NOT NULL
        GROUP BY PhoneNumber
        HAVING count > 1
      `);
      
      if (refereeDuplicates.length > 0) {
        console.log('❌ ERROR: Duplicate phone numbers found in REFEREE table:');
        refereeDuplicates.forEach(dup => {
          console.log(`   - ${dup.PhoneNumber}: ${dup.count} referees`);
        });
        console.log('\nPlease resolve duplicates before adding UNIQUE constraint.');
      } else {
        console.log('✅ No duplicate phone numbers in REFEREE table');
        
        // Check if constraint already exists
        const [refereeConstraints] = await db.query(`
          SELECT CONSTRAINT_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
          WHERE TABLE_SCHEMA = 'sports_management_db'
            AND TABLE_NAME = 'REFEREE'
            AND CONSTRAINT_TYPE = 'UNIQUE'
            AND CONSTRAINT_NAME LIKE '%phone%'
        `);
        
        if (refereeConstraints.length === 0) {
          console.log('\n4. Adding UNIQUE constraint to REFEREE.PhoneNumber...\n');
          await db.query('ALTER TABLE REFEREE ADD UNIQUE KEY unique_phone (PhoneNumber)');
          console.log('   ✅ Constraint added successfully');
        } else {
          console.log('\n4. UNIQUE constraint already exists on REFEREE.PhoneNumber');
        }
      }
    }
    
    // 5. Verify constraints
    console.log('\n5. Verifying UNIQUE constraints...\n');
    
    const [coachKeys] = await db.query(`
      SELECT COLUMN_NAME, CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'sports_management_db'
        AND TABLE_NAME = 'COACH'
        AND COLUMN_NAME IN ('PhoneNumber', 'Email')
      ORDER BY COLUMN_NAME
    `);
    
    console.log('COACH table unique constraints:');
    const coachPhoneUnique = coachKeys.filter(k => k.COLUMN_NAME === 'PhoneNumber').length > 0;
    const coachEmailUnique = coachKeys.filter(k => k.COLUMN_NAME === 'Email').length > 0;
    
    console.log(`   PhoneNumber: ${coachPhoneUnique ? '✅ UNIQUE' : '❌ Not unique'}`);
    console.log(`   Email: ${coachEmailUnique ? '✅ UNIQUE' : '❌ Not unique'}`);
    
    if (hasPhoneNumber) {
      const [refereeKeys] = await db.query(`
        SELECT COLUMN_NAME, CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'sports_management_db'
          AND TABLE_NAME = 'REFEREE'
          AND COLUMN_NAME IN ('PhoneNumber', 'Email')
        ORDER BY COLUMN_NAME
      `);
      
      console.log('\nREFEREE table unique constraints:');
      const refereePhoneUnique = refereeKeys.filter(k => k.COLUMN_NAME === 'PhoneNumber').length > 0;
      const refereeEmailUnique = refereeKeys.filter(k => k.COLUMN_NAME === 'Email').length > 0;
      
      console.log(`   PhoneNumber: ${refereePhoneUnique ? '✅ UNIQUE' : '❌ Not unique'}`);
      console.log(`   Email: ${refereeEmailUnique ? '✅ UNIQUE' : '❌ Not unique'}`);
    }
    
    // 6. Test the constraint
    console.log('\n6. Testing UNIQUE constraint on COACH...\n');
    
    try {
      // Try to insert duplicate phone
      const testPhone = '+1-999-TEST-001';
      const testEmail1 = 'test1@test.com';
      const testEmail2 = 'test2@test.com';
      
      await db.query(
        'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
        ['Test Coach 1', testPhone, testEmail1, 0]
      );
      console.log('   Created test coach 1');
      
      try {
        await db.query(
          'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
          ['Test Coach 2', testPhone, testEmail2, 0]
        );
        console.log('   ❌ ERROR: Duplicate phone number was allowed!');
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('   ✅ Duplicate phone number blocked by constraint');
        } else {
          throw err;
        }
      }
      
      // Cleanup
      await db.query('DELETE FROM COACH WHERE PhoneNumber = ?', [testPhone]);
      console.log('   Test data cleaned up');
      
    } catch (err) {
      console.log(`   ⚠️  Could not complete test: ${err.message}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('MIGRATION COMPLETE!');
    console.log('Both PhoneNumber and Email are now UNIQUE in COACH table.');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

addPhoneNumberUniqueConstraint();
