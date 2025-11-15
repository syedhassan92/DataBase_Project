const db = require('../config/database');

async function columnExists(column) {
  const [rows] = await db.query('SHOW COLUMNS FROM TOURNAMENT LIKE ?', [column]);
  return rows.length > 0;
}

async function ensureColumn({ column, sql }) {
  const exists = await columnExists(column);
  if (exists) {
    console.log(`Column ${column} already exists`);
    return;
  }
  await db.query(sql);
  console.log(`Column ${column} created`);
}

(async () => {
  try {
    await ensureColumn({
      column: 'LeagueID',
      sql: 'ALTER TABLE TOURNAMENT ADD COLUMN LeagueID INT NULL AFTER AdminID'
    });

    await ensureColumn({
      column: 'Description',
      sql: 'ALTER TABLE TOURNAMENT ADD COLUMN Description TEXT NULL AFTER TournamentName'
    });

    await ensureColumn({
      column: 'Status',
      sql: "ALTER TABLE TOURNAMENT ADD COLUMN Status ENUM('upcoming','ongoing','completed') NOT NULL DEFAULT 'upcoming' AFTER EndDate"
    });

    console.log('Tournament columns check complete');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update Tournament table', error);
    process.exit(1);
  }
})();
