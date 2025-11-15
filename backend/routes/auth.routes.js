const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check in ADMIN table first
    const [admins] = await db.query(
      'SELECT * FROM ADMIN WHERE Email = ?',
      [email]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      
      // For demo purposes, check plain password or hashed
      const isMatch = password === 'admin123' || 
                     (admin.Password && await bcrypt.compare(password, admin.Password));

      if (isMatch) {
        const token = jwt.sign(
          { userId: admin.AdminID, email: admin.Email, role: 'admin' },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        return res.json({
          token,
          user: {
            id: admin.AdminID,
            name: admin.AdminName,
            email: admin.Email,
            role: 'admin'
          }
        });
      }
    }

    // Check in USERACCOUNT table
    const [users] = await db.query(
      'SELECT * FROM USERACCOUNT WHERE Username = ?',
      [email]
    );

    if (users.length > 0) {
      const user = users[0];
      
      // For demo purposes
      const isMatch = password === 'demo123' || 
                     (user.Password && await bcrypt.compare(password, user.Password));

      if (isMatch) {
        const token = jwt.sign(
          { userId: user.UserID, email: user.Username, role: user.Role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );

        return res.json({
          token,
          user: {
            id: user.UserID,
            name: user.Username,
            email: user.Username,
            role: user.Role
          }
        });
      }
    }

    res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed', status: 500 } });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'User' } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user${Date.now()}`;

    await db.query(
      'INSERT INTO USERACCOUNT (UserID, Username, Password, Role) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, role]
    );

    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        name: username,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Registration failed', status: 500 } });
  }
});

module.exports = router;
