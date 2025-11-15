const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [transfers] = await db.query(`
      SELECT t.*, td.PlayerID, p.PlayerName,
        ft.TeamName as FromTeamName, tt.TeamName as ToTeamName
      FROM TRANSFER t
      LEFT JOIN TRANSFERDETAILS td ON t.TransferID = td.TransferID
      LEFT JOIN PLAYER p ON td.PlayerID = p.PlayerID
      LEFT JOIN TEAM ft ON t.FromTeamID = ft.TeamID
      LEFT JOIN TEAM tt ON t.ToTeamID = tt.TeamID
      ORDER BY t.TransferDate DESC
    `);
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch transfers', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { transferId, leagueId, fromTeamId, toTeamId, transferDate, transferType, playerId } = req.body;
    
    await db.query(
      'INSERT INTO TRANSFER (TransferID, LeagueID, FromTeamID, ToTeamID, TransferDate, TransferType) VALUES (?, ?, ?, ?, ?, ?)',
      [transferId, leagueId || null, fromTeamId || null, toTeamId || null, transferDate, transferType || 'Permanent']
    );

    if (playerId) {
      const detailsId = `TD${Date.now()}`;
      await db.query(
        'INSERT INTO TRANSFERDETAILS (TransferDetailsID, TransferID, PlayerID) VALUES (?, ?, ?)',
        [detailsId, transferId, playerId]
      );
    }

    res.status(201).json({ message: 'Transfer created successfully', transferId });
  } catch (error) {
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
