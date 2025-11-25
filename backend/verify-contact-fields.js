const db = require('./config/database');

async function verifyContactFieldsSplit() {
  console.log('='.repeat(70));
  console.log('VERIFICATION: Coach & Referee Contact Fields Split');
  console.log('='.repeat(70));
  
  try {
    // 1. Verify COACH table structure
    console.log('\n1. COACH Table Structure:\n');
    const [coachColumns] = await db.query('DESCRIBE COACH');
    
    const hasCoachPhone = coachColumns.some(col => col.Field === 'PhoneNumber');
    const hasCoachEmail = coachColumns.some(col => col.Field === 'Email');
    const hasCoachContact = coachColumns.some(col => col.Field === 'Contact');
    
    coachColumns.forEach(col => {
      const markers = [];
      if (col.Key === 'PRI') markers.push('PRIMARY KEY');
      if (col.Key === 'UNI') markers.push('UNIQUE');
      if (col.Null === 'NO') markers.push('NOT NULL');
      
      const markerStr = markers.length > 0 ? ` (${markers.join(', ')})` : '';
      console.log(`   ${col.Field}: ${col.Type}${markerStr}`);
    });
    
    if (hasCoachPhone && hasCoachEmail && !hasCoachContact) {
      console.log('\n   ✅ COACH table has PhoneNumber and Email (Contact removed)');
    } else if (hasCoachContact) {
      console.log('\n   ❌ COACH table still has old Contact field');
    } else {
      console.log('\n   ⚠️  COACH table missing PhoneNumber or Email');
    }
    
    // 2. Show coach data
    console.log('\n2. Coach Data:\n');
    const [coaches] = await db.query('SELECT CoachID, CoachName, PhoneNumber, Email, Experience FROM COACH ORDER BY CoachID');
    
    coaches.forEach(coach => {
      console.log(`   Coach #${coach.CoachID}: ${coach.CoachName}`);
      console.log(`      📱 Phone: ${coach.PhoneNumber || 'Not set'}`);
      console.log(`      📧 Email: ${coach.Email || 'Not set'}`);
      console.log(`      🏆 Experience: ${coach.Experience} years\n`);
    });
    
    // 3. Verify REFEREE table structure
    console.log('3. REFEREE Table Structure:\n');
    const [refereeColumns] = await db.query('DESCRIBE REFEREE');
    
    const hasRefereePhone = refereeColumns.some(col => col.Field === 'PhoneNumber');
    const hasRefereeEmail = refereeColumns.some(col => col.Field === 'Email');
    const hasRefereeContact = refereeColumns.some(col => col.Field === 'Contact');
    
    refereeColumns.forEach(col => {
      const markers = [];
      if (col.Key === 'PRI') markers.push('PRIMARY KEY');
      if (col.Key === 'UNI') markers.push('UNIQUE');
      if (col.Null === 'NO') markers.push('NOT NULL');
      
      const markerStr = markers.length > 0 ? ` (${markers.join(', ')})` : '';
      console.log(`   ${col.Field}: ${col.Type}${markerStr}`);
    });
    
    if (hasRefereePhone && hasRefereeEmail && !hasRefereeContact) {
      console.log('\n   ✅ REFEREE table has PhoneNumber and Email (Contact removed)');
    } else if (hasRefereeContact) {
      console.log('\n   ⚠️  REFEREE table still has old Contact field (not migrated yet)');
    } else {
      console.log('\n   ⚠️  REFEREE table missing PhoneNumber or Email');
    }
    
    // 4. Summary
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY:');
    console.log('='.repeat(70));
    console.log(`✅ COACH table: Contact split into PhoneNumber and Email`);
    console.log(`   - ${coaches.filter(c => c.PhoneNumber).length}/${coaches.length} coaches have phone numbers`);
    console.log(`   - ${coaches.filter(c => c.Email).length}/${coaches.length} coaches have emails`);
    
    if (hasRefereeContact) {
      console.log(`⚠️  REFEREE table: Still using Contact field (needs migration)`);
    } else if (hasRefereePhone && hasRefereeEmail) {
      console.log(`✅ REFEREE table: Contact split into PhoneNumber and Email`);
    }
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

verifyContactFieldsSplit();
