const db = require('../config/database');

async function verifySchema() {
  try {
    console.log('Verifying database schema...\n');

    // Get all tables
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'sports_management_db' 
      ORDER BY TABLE_NAME
    `);

    console.log('📋 Database Tables:\n');
    
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`\n▶ ${tableName}`);
      
      // Get columns for this table
      const [columns] = await db.query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT,
          EXTRA
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'sports_management_db' 
          AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [tableName]);

      columns.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const key = col.COLUMN_KEY ? ` [${col.COLUMN_KEY}]` : '';
        const extra = col.EXTRA ? ` ${col.EXTRA}` : '';
        console.log(`  • ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${nullable}${key}${extra}`);
      });
    }

    console.log('\n\n✅ Schema verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying schema:', error.message);
    process.exit(1);
  }
}

verifySchema();
