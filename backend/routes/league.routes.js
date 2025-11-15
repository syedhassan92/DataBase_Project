const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Get all leagues
router.get('/', async (req, res) => {
  try {
    const [leagues] = await db.query('SELECT * FROM LEAGUE ORDER BY CreatedAt DESC');
    res.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({ error: { message: 'Failed to fetch leagues', status: 500 } });
  }
});

// Get league by ID
router.get('/:id', async (req, res) => {
  try {
    const [leagues] = await db.query('SELECT * FROM LEAGUE WHERE LeagueID = ?', [req.params.id]);
    if (leagues.length === 0) {
      return res.status(404).json({ error: { message: 'League not found', status: 404 } });
    }
    res.json(leagues[0]);
  } catch (error) {
    console.error('Error fetching league:', error);
    res.status(500).json({ error: { message: 'Failed to fetch league', status: 500 } });
  }
});

// Create league (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { leagueName, startDate, endDate } = req.body;
    
    // Debug logging
    console.log('Request user object:', req.user);
    console.log('Request body:', req.body);
    
    const adminId = Number(req.user?.userId);
    
    if (!adminId) {
      console.error('Admin ID not found in token. User object:', req.user);
      return res.status(400).json({ 
        error: { 
          message: 'Admin context missing. Please log in again.', 
          status: 400 
        } 
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO LEAGUE (AdminID, LeagueName, StartDate, EndDate) VALUES (?, ?, ?, ?)',
      [adminId, leagueName, startDate || null, endDate || null]
    );

    res.status(201).json({ 
      message: 'League created successfully', 
      leagueId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating league:', error);
    res.status(500).json({ error: { message: 'Failed to create league', status: 500 } });
  }
});

// Update league (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { leagueName, startDate, endDate } = req.body;
    
    await db.query(
      'UPDATE LEAGUE SET LeagueName = ?, StartDate = ?, EndDate = ? WHERE LeagueID = ?',
      [leagueName, startDate || null, endDate || null, req.params.id]
    );

    res.json({ message: 'League updated successfully' });
  } catch (error) {
    console.error('Error updating league:', error);
    res.status(500).json({ error: { message: 'Failed to update league', status: 500 } });
  }
});

// Delete league (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM LEAGUE WHERE LeagueID = ?', [req.params.id]);
    res.json({ message: 'League deleted successfully' });
  } catch (error) {
    console.error('Error deleting league:', error);
    res.status(500).json({ error: { message: 'Failed to delete league', status: 500 } });
  }
});

module.exports = router;
