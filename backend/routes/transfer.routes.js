const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [transfers] = await db.query(`
      SELECT t.*, p.PlayerName, l.LeagueName,
        ft.TeamName as FromTeamName, tt.TeamName as ToTeamName
      FROM TRANSFER t
      LEFT JOIN PLAYER p ON t.PlayerID = p.PlayerID
      LEFT JOIN LEAGUE l ON t.LeagueID = l.LeagueID
      LEFT JOIN TEAM ft ON t.FromTeamID = ft.TeamID
      LEFT JOIN TEAM tt ON t.ToTeamID = tt.TeamID
      ORDER BY t.TransferDate DESC
    `);
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transfers', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { playerId, leagueId, fromTeamId, toTeamId, transferDate, transferType } = req.body;
    
    if (!playerId || !toTeamId || !leagueId) {
      return res.status(400).json({ 
        error: { 
          message: 'Player, destination team, and league are required', 
          status: 400 
        } 
      });
    }

    const [result] = await db.query(
      'INSERT INTO TRANSFER (PlayerID, FromTeamID, ToTeamID, LeagueID, TransferDate, TransferType) VALUES (?, ?, ?, ?, ?, ?)',
      [playerId, fromTeamId || null, toTeamId, leagueId, transferDate, transferType || 'Permanent']
    );

    res.status(201).json({ 
      message: 'Transfer created successfully', 
      transferId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: { message: 'Failed to create transfer', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM TRANSFER WHERE TransferID = ?', [req.params.id]);
    res.json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete transfer', status: 500 } });
  }
});

module.exports = router;
