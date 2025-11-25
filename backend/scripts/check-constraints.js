const db = require('../config/database');

async function checkConstraints() {
  try {
    const [result] = await db.query('SHOW CREATE TABLE TEAMLEAGUE');
    console.log('\n=== TEAMLEAGUE Table Structure ===\n');
    console.log(result[0]['Create Table']);
    console.log('\n');
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkConstraints();
