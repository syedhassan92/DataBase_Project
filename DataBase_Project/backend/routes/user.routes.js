const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT UserID, Username, Email, Role, CreatedAt FROM USERACCOUNT');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if username already exists
    const [existingUsername] = await db.query('SELECT * FROM USERACCOUNT WHERE Username = ?', [username]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const [existingEmail] = await db.query('SELECT * FROM USERACCOUNT WHERE Email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO USERACCOUNT (Username, Email, Password, Role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'User']
    );

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId,
      username,
      email,
      role: role || 'User'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const userId = req.params.id;

    await db.query(
      'UPDATE USERACCOUNT SET Username = ?, Email = ?, Role = ? WHERE UserID = ?',
      [username, email, role, userId]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await db.query('DELETE FROM USERACCOUNT WHERE UserID = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
