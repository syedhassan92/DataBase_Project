const db = require('../config/database');

async function migrateCoachContactFields() {
  console.log('='.repeat(70));
  console.log('MIGRATION: Split Coach Contact into PhoneNumber and Email');
  console.log('='.repeat(70));
  
  try {
    // 1. Check current table structure
    console.log('\n1. Checking current COACH table structure...\n');
    const [columns] = await db.query('DESCRIBE COACH');
    
    const hasContact = columns.some(col => col.Field === 'Contact');
    const hasPhoneNumber = columns.some(col => col.Field === 'PhoneNumber');
    const hasEmail = columns.some(col => col.Field === 'Email');
    
    console.log('Current columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})${col.Null === 'NO' ? ' NOT NULL' : ''}`);
    });
    
    if (hasPhoneNumber && hasEmail && !hasContact) {
      console.log('\n✅ Migration already complete! PhoneNumber and Email fields exist.');
      return;
    }
    
    // 2. Backup existing Contact data
    if (hasContact) {
      console.log('\n2. Backing up existing Contact data...\n');
      const [coaches] = await db.query('SELECT CoachID, CoachName, Contact FROM COACH');
      
      if (coaches.length > 0) {
        console.log(`   Found ${coaches.length} coach(es) with contact information:`);
        coaches.forEach(coach => {
          console.log(`     - ${coach.CoachName}: ${coach.Contact}`);
        });
      }
      
      // 3. Add new columns
      console.log('\n3. Adding PhoneNumber and Email columns...\n');
      
      if (!hasPhoneNumber) {
        await db.query('ALTER TABLE COACH ADD COLUMN PhoneNumber VARCHAR(20) AFTER CoachName');
        console.log('   ✅ PhoneNumber column added');
      }
      
      if (!hasEmail) {
        await db.query('ALTER TABLE COACH ADD COLUMN Email VARCHAR(100) AFTER PhoneNumber');
        console.log('   ✅ Email column added');
      }
      
      // 4. Migrate data from Contact to Email (assuming Contact contains email)
      console.log('\n4. Migrating data from Contact to Email...\n');
      
      for (const coach of coaches) {
        if (coach.Contact) {
          // If contact looks like email, put it in email field
          if (coach.Contact.includes('@')) {
            await db.query('UPDATE COACH SET Email = ? WHERE CoachID = ?', [coach.Contact, coach.CoachID]);
            console.log(`   ${coach.CoachName}: Moved to Email field`);
          } else {
            // Otherwise, assume it's a phone number
            await db.query('UPDATE COACH SET PhoneNumber = ? WHERE CoachID = ?', [coach.Contact, coach.CoachID]);
            console.log(`   ${coach.CoachName}: Moved to PhoneNumber field`);
          }
        }
      }
      
      // 5. Add UNIQUE constraint to Email
      console.log('\n5. Adding UNIQUE constraint to Email...\n');
      try {
        await db.query('ALTER TABLE COACH ADD UNIQUE KEY unique_email (Email)');
        console.log('   ✅ UNIQUE constraint added to Email');
      } catch (err) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log('   ⚠️  UNIQUE constraint already exists');
        } else {
          throw err;
        }
      }
      
      // 6. Drop old Contact column
      console.log('\n6. Dropping old Contact column...\n');
      await db.query('ALTER TABLE COACH DROP COLUMN Contact');
      console.log('   ✅ Contact column removed');
      
    } else {
      console.log('\n⚠️  Contact column does not exist. Skipping migration.');
    }
    
    // 7. Verify new structure
    console.log('\n7. Verifying new table structure...\n');
    const [newColumns] = await db.query('DESCRIBE COACH');
    
    console.log('Updated columns:');
    newColumns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})${col.Null === 'NO' ? ' NOT NULL' : ''}${col.Key === 'UNI' ? ' UNIQUE' : ''}`);
    });
    
    // 8. Show migrated data
    console.log('\n8. Verifying migrated coach data...\n');
    const [updatedCoaches] = await db.query('SELECT CoachID, CoachName, PhoneNumber, Email, Experience FROM COACH');
    
    if (updatedCoaches.length > 0) {
      console.log(`   ${updatedCoaches.length} coach(es) in database:`);
      updatedCoaches.forEach(coach => {
        console.log(`     - ${coach.CoachName}:`);
        console.log(`       Phone: ${coach.PhoneNumber || 'N/A'}`);
        console.log(`       Email: ${coach.Email || 'N/A'}`);
        console.log(`       Experience: ${coach.Experience} years`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('MIGRATION COMPLETE!');
    console.log('Coach contact is now split into PhoneNumber and Email fields.');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

migrateCoachContactFields();
