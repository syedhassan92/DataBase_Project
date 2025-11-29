const db = require('../config/database');
require('dotenv').config();

async function updateUser() {
    try {
        console.log('Updating user credentials...');

        // Update the username to the email address
        const [result] = await db.query(
            "UPDATE USERACCOUNT SET Username = 'user@sports.com' WHERE Username = 'user'"
        );

        if (result.affectedRows > 0) {
            console.log('✅ Successfully updated user credentials.');
            console.log('New Login: user@sports.com');
            console.log('Password: user123');
        } else {
            console.log('ℹ️ User "user" not found. It might have already been updated.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating user:', error);
        process.exit(1);
    }
}

updateUser();
