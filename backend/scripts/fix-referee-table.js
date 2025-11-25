const db = require('../config/database');

async function fixRefereeTable() {
  try {
    console.log('Fixing REFEREE table to match schema...\n');

    // Check if Contact column exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sports_management_db' 
        AND TABLE_NAME = 'REFEREE'
    `);

    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', columnNames.join(', '));

    // Drop Contact column if it exists
    if (columnNames.includes('Contact')) {
      await db.query('ALTER TABLE REFEREE DROP COLUMN Contact');
      console.log('✓ Removed Contact column');
    }

    // Add PhoneNumber column if it doesn't exist
    if (!columnNames.includes('PhoneNumber')) {
      await db.query('ALTER TABLE REFEREE ADD COLUMN PhoneNumber VARCHAR(20) UNIQUE AFTER RefereeName');
      console.log('✓ Added PhoneNumber column');
    }

    // Add Email column if it doesn't exist
    if (!columnNames.includes('Email')) {
      await db.query('ALTER TABLE REFEREE ADD COLUMN Email VARCHAR(100) UNIQUE AFTER PhoneNumber');
      console.log('✓ Added Email column');
    }

    console.log('\n✅ REFEREE table fixed successfully!');
    console.log('\nNew structure: RefereeID, RefereeName, PhoneNumber, Email, AvailabilityStatus, CreatedAt');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing REFEREE table:', error.message);
    process.exit(1);
  }
}

fixRefereeTable();
