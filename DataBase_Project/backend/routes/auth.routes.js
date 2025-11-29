const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    // Check in USERACCOUNT table by Email
    const [users] = await db.query(
      'SELECT * FROM USERACCOUNT WHERE Email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
    }

    const user = users[0];

    // Validate role-based access
    // Normalize roles for comparison
    const userRole = user.Role.toLowerCase();
    const reqRole = requestedRole ? requestedRole.toLowerCase() : null;

    // If a specific role was requested (from login page), verify it matches
    if (reqRole) {
      if (userRole === 'admin' && reqRole !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Admin accounts must login through the Admin Login page',
            status: 403
          }
        });
      }

      if (userRole === 'user' && reqRole !== 'user') {
        return res.status(403).json({
          error: {
            message: 'User accounts must login through the User Login page',
            status: 403
          }
        });
      }
    }

    // For demo purposes, check plain password or hashed
    const isMatch = password === user.Password ||
      (user.Password && await bcrypt.compare(password, user.Password));

    if (!isMatch) {
      return res.status(401).json({ error: { message: 'Invalid credentials', status: 401 } });
    }

    // If user is Admin, get admin details
    let responseUser = {
      id: user.UserID,
      name: user.Username,
      email: user.Email,
      role: userRole
    };

    if (user.Role === 'Admin') {
      const [admins] = await db.query(
        'SELECT * FROM ADMIN WHERE UserID = ?',
        [user.UserID]
      );

      if (admins.length > 0) {
        responseUser.name = admins[0].AdminName;
        responseUser.id = admins[0].AdminID;
      }
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      token,
      user: responseUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed', status: 500 } });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Force role to 'User' - admins can only be created via database
    const role = 'User';

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO USERACCOUNT (Username, Email, Password, Role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { userId, email, role: role.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        name: username,
        email,
        role: role.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate email or username
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('Email')) {
        return res.status(400).json({ error: { message: 'Email already registered', status: 400 } });
      }
      if (error.message.includes('Username')) {
        return res.status(400).json({ error: { message: 'Username already taken', status: 400 } });
      }
      return res.status(400).json({ error: { message: 'Account already exists', status: 400 } });
    }

    res.status(500).json({ error: { message: 'Registration failed', status: 500 } });
  }
});

module.exports = router;
