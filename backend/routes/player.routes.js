const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    
    let query = `
      SELECT 
        p.PlayerID, 
        p.PlayerName, 
        p.PlayerRole, 
        p.CreatedAt,
        t.TeamID,
        t.TeamName
      FROM PLAYER p
      LEFT JOIN PLAYERTEAM pt ON p.PlayerID = pt.PlayerID AND pt.IsCurrent = 1
      LEFT JOIN TEAM t ON pt.TeamID = t.TeamID
    `;
    
    const params = [];
    
    if (teamId) {
      query += ` WHERE t.TeamID = ?`;
      params.push(teamId);
    }
    
    query += ` ORDER BY p.CreatedAt DESC`;
    
    const [players] = await db.query(query, params);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch players', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [players] = await db.query('SELECT * FROM PLAYER WHERE PlayerID = ?', [req.params.id]);
    if (players.length === 0) {
      return res.status(404).json({ error: { message: 'Player not found', status: 404 } });
    }
    res.json(players[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch player', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { playerName, playerRole } = req.body;
    const [result] = await db.query(
      'INSERT INTO PLAYER (PlayerName, PlayerRole) VALUES (?, ?)',
      [playerName, playerRole || null]
    );
    res.status(201).json({ message: 'Player created successfully', playerId: result.insertId });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: { message: 'Failed to create player', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { playerName, playerRole } = req.body;
    await db.query(
      'UPDATE PLAYER SET PlayerName = ?, PlayerRole = ? WHERE PlayerID = ?',
      [playerName, playerRole || null, req.params.id]
    );
    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update player', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM PLAYER WHERE PlayerID = ?', [req.params.id]);
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete player', status: 500 } });
  }
});

module.exports = router;
