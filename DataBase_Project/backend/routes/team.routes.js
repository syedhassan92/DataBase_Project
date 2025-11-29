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

// Get teams by league
router.get('/league/:leagueId', async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT t.TeamID, t.TeamName
      FROM TEAM t
      JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID
      WHERE tl.LeagueID = ?
      ORDER BY t.TeamName
    `, [req.params.leagueId]);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams by league:', error);
    res.status(500).json({ error: { message: 'Failed to fetch teams', status: 500 } });
  }
});

// Get teams by tournament
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT t.TeamID, t.TeamName
      FROM TEAM t
      JOIN TOURNAMENTTEAM tt ON t.TeamID = tt.TeamID
      WHERE tt.TournamentID = ?
      ORDER BY t.TeamName
    `, [req.params.tournamentId]);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams by tournament:', error);
    res.status(500).json({ error: { message: 'Failed to fetch teams', status: 500 } });
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
    
    // Validate required fields (only teamName and leagueId are required)
    if (!teamName || !leagueId) {
      return res.status(400).json({ 
        error: { 
          message: 'Team Name and League are required fields', 
          status: 400 
        } 
      });
    }

    // Check if team name already exists in this league
    const [existingTeams] = await db.query(`
      SELECT t.TeamID, t.TeamName 
      FROM TEAM t
      INNER JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID
      WHERE t.TeamName = ? AND tl.LeagueID = ?
    `, [teamName, leagueId]);

    if (existingTeams.length > 0) {
      return res.status(400).json({
        error: {
          message: 'A team with this name already exists in the selected league',
          status: 400
        }
      });
    }

    const [result] = await db.query(
      'INSERT INTO TEAM (TeamName) VALUES (?)',
      [teamName]
    );
    const teamId = result.insertId;
    
    // Create TEAMLEAGUE entry (league is required, coach is optional)
    await db.query(
      'INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES (?, ?, ?)',
      [teamId, leagueId, coachId || null]
    );
    
    res.status(201).json({ message: 'Team created successfully', teamId });
  } catch (error) {
    // Check if error is due to coach already assigned to another team
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('unique_coach')) {
      return res.status(400).json({ error: { message: 'This coach is already assigned to another team. Each coach can only coach one team.', status: 400 } });
    }
    console.error('Error creating team:', error);
    res.status(500).json({ error: { message: 'Failed to create team', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { teamName, leagueId, coachId } = req.body;
    
    // Validate required fields (only teamName and leagueId are required)
    if (!teamName || !leagueId) {
      return res.status(400).json({ 
        error: { 
          message: 'Team Name and League are required fields', 
          status: 400 
        } 
      });
    }

    // Check if team name already exists in this league (excluding current team)
    const [existingTeams] = await db.query(`
      SELECT t.TeamID, t.TeamName 
      FROM TEAM t
      INNER JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID
      WHERE t.TeamName = ? AND tl.LeagueID = ? AND t.TeamID != ?
    `, [teamName, leagueId, req.params.id]);

    if (existingTeams.length > 0) {
      return res.status(400).json({
        error: {
          message: 'A team with this name already exists in the selected league',
          status: 400
        }
      });
    }

    await db.query(
      'UPDATE TEAM SET TeamName = ? WHERE TeamID = ?',
      [teamName, req.params.id]
    );
    
    // Update TEAMLEAGUE (league is required, coach is optional)
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
    
    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    // Check if error is due to coach already assigned to another team
    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('unique_coach')) {
      return res.status(400).json({ error: { message: 'This coach is already assigned to another team. Each coach can only coach one team.', status: 400 } });
    }
    console.error('Error updating team:', error);
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
