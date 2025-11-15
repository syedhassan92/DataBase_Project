const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT t.TeamID, t.TeamName, t.CreatedAt,
             GROUP_CONCAT(DISTINCT l.LeagueName SEPARATOR ', ') as LeagueNames,
             GROUP_CONCAT(DISTINCT c.CoachName SEPARATOR ', ') as CoachNames,
             GROUP_CONCAT(DISTINCT tl.LeagueID) as LeagueID,
             GROUP_CONCAT(DISTINCT tl.CoachID) as CoachID
      FROM TEAM t
      LEFT JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID
      LEFT JOIN LEAGUE l ON tl.LeagueID = l.LeagueID
      LEFT JOIN COACH c ON tl.CoachID = c.CoachID
      GROUP BY t.TeamID, t.TeamName, t.CreatedAt
      ORDER BY t.CreatedAt DESC
    `);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to fetch teams', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [teams] = await db.query('SELECT * FROM TEAM WHERE TeamID = ?', [req.params.id]);
    if (teams.length === 0) {
      return res.status(404).json({ error: { message: 'Team not found', status: 404 } });
    }
    res.json(teams[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch team', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { teamName, leagueId, coachId } = req.body;
    const [result] = await db.query(
      'INSERT INTO TEAM (TeamName) VALUES (?)',
      [teamName]
    );
    const teamId = result.insertId;
    
    // If league and coach provided, create TEAMLEAGUE entry
    if (leagueId) {
      await db.query(
        'INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES (?, ?, ?)',
        [teamId, leagueId, coachId || null]
      );
    }
    
    res.status(201).json({ message: 'Team created successfully', teamId });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create team', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { teamName, leagueId, coachId } = req.body;
    await db.query(
      'UPDATE TEAM SET TeamName = ? WHERE TeamID = ?',
      [teamName, req.params.id]
    );
    
    // Update TEAMLEAGUE if league info provided
    if (leagueId) {
      // Check if entry exists
      const [existing] = await db.query(
        'SELECT * FROM TEAMLEAGUE WHERE TeamID = ? AND LeagueID = ?',
        [req.params.id, leagueId]
      );
      
      if (existing.length > 0) {
        await db.query(
          'UPDATE TEAMLEAGUE SET CoachID = ? WHERE TeamID = ? AND LeagueID = ?',
          [coachId || null, req.params.id, leagueId]
        );
      } else {
        await db.query(
          'INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES (?, ?, ?)',
          [req.params.id, leagueId, coachId || null]
        );
      }
    }
    
    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update team', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM TEAM WHERE TeamID = ?', [req.params.id]);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete team', status: 500 } });
  }
});

module.exports = router;
