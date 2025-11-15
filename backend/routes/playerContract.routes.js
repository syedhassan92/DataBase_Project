const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Get all player contracts
router.get('/', adminAuth, async (req, res) => {
  try {
    const [contracts] = await db.query(`
      SELECT 
        pt.*,
        p.PlayerName,
        p.PlayerRole,
        t.TeamName
      FROM PLAYERTEAM pt
      LEFT JOIN PLAYER p ON pt.PlayerID = p.PlayerID
      LEFT JOIN TEAM t ON pt.TeamID = t.TeamID
      ORDER BY pt.IsCurrent DESC, pt.StartDate DESC
    `);
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching player contracts:', error);
    res.status(500).json({ message: 'Failed to fetch player contracts' });
  }
});

// Get contracts for a specific player
router.get('/player/:playerId', adminAuth, async (req, res) => {
  try {
    const [contracts] = await db.query(`
      SELECT 
        pt.*,
        t.TeamName
      FROM PLAYERTEAM pt
      LEFT JOIN TEAM t ON pt.TeamID = t.TeamID
      WHERE pt.PlayerID = ?
      ORDER BY pt.IsCurrent DESC, pt.StartDate DESC
    `, [req.params.playerId]);
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching player contracts:', error);
    res.status(500).json({ message: 'Failed to fetch player contracts' });
  }
});

// Get contracts for a specific team
router.get('/team/:teamId', adminAuth, async (req, res) => {
  try {
    const [contracts] = await db.query(`
      SELECT 
        pt.*,
        p.PlayerName,
        p.PlayerRole
      FROM PLAYERTEAM pt
      LEFT JOIN PLAYER p ON pt.PlayerID = p.PlayerID
      WHERE pt.TeamID = ?
      ORDER BY pt.IsCurrent DESC, pt.StartDate DESC
    `, [req.params.teamId]);
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching team contracts:', error);
    res.status(500).json({ message: 'Failed to fetch team contracts' });
  }
});

// Create new contract
router.post('/', adminAuth, async (req, res) => {
  try {
    const { playerId, teamId, contractDetails, startDate, endDate, isCurrent } = req.body;

    // If this is marked as current, set all other contracts for this player to inactive
    if (isCurrent) {
      await db.query(
        'UPDATE PLAYERTEAM SET IsCurrent = FALSE WHERE PlayerID = ?',
        [playerId]
      );
    }

    const [result] = await db.query(
      `INSERT INTO PLAYERTEAM (PlayerID, TeamID, ContractDetails, StartDate, EndDate, IsCurrent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [playerId, teamId, contractDetails || null, startDate || null, endDate || null, isCurrent ? 1 : 0]
    );

    res.status(201).json({ 
      message: 'Contract created successfully',
      contractId: result.insertId
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Failed to create contract' });
  }
});

// Update contract
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { playerId, teamId, contractDetails, startDate, endDate, isCurrent } = req.body;
    
    // Get the contract to find the player ID
    const [existing] = await db.query(
      'SELECT PlayerID FROM PLAYERTEAM WHERE PlayerTeamID = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // If this is marked as current, set all other contracts for this player to inactive
    if (isCurrent) {
      await db.query(
        'UPDATE PLAYERTEAM SET IsCurrent = FALSE WHERE PlayerID = ? AND PlayerTeamID != ?',
        [existing[0].PlayerID, req.params.id]
      );
    }

    await db.query(
      `UPDATE PLAYERTEAM 
       SET TeamID = ?, ContractDetails = ?, StartDate = ?, EndDate = ?, IsCurrent = ?
       WHERE PlayerTeamID = ?`,
      [teamId, contractDetails || null, startDate || null, endDate || null, isCurrent ? 1 : 0, req.params.id]
    );

    res.json({ message: 'Contract updated successfully' });
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ message: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM PLAYERTEAM WHERE PlayerTeamID = ?', [req.params.id]);
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ message: 'Failed to delete contract' });
  }
});

module.exports = router;
