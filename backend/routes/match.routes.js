const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [matches] = await db.query(`
      SELECT m.*, 
        l.LeagueName, t.TournamentName, v.VenueName, r.RefereeName
      FROM MATCH m
      LEFT JOIN LEAGUE l ON m.LeagueID = l.LeagueID
      LEFT JOIN TOURNAMENT t ON m.TournamentID = t.TournamentID
      LEFT JOIN VENUE v ON m.VenueID = v.VenueID
      LEFT JOIN REFEREE r ON m.RefereeID = r.RefereeID
      ORDER BY m.MatchDate DESC, m.MatchTime DESC
    `);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch matches', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [matches] = await db.query('SELECT * FROM \`MATCH\` WHERE MatchID = ?', [req.params.id]);
    if (matches.length === 0) {
      return res.status(404).json({ error: { message: 'Match not found', status: 404 } });
    }
    res.json(matches[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch match', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { matchId, leagueId, tournamentId, venueId, refereeId, matchDate, matchTime, status } = req.body;
    await db.query(
      'INSERT INTO \`MATCH\` (MatchID, LeagueID, TournamentID, VenueID, RefereeID, MatchDate, MatchTime, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [matchId, leagueId || null, tournamentId || null, venueId || null, refereeId || null, matchDate, matchTime, status || 'scheduled']
    );
    res.status(201).json({ message: 'Match created successfully', matchId });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create match', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { matchDate, matchTime, team1Score, team2Score, status, winnerTeamId, highlights } = req.body;
    await db.query(
      'UPDATE \`MATCH\` SET MatchDate = ?, MatchTime = ?, Team1Score = ?, Team2Score = ?, Status = ?, WinnerTeamID = ?, Highlights = ? WHERE MatchID = ?',
      [matchDate, matchTime, team1Score || null, team2Score || null, status || 'scheduled', winnerTeamId || null, highlights || null, req.params.id]
    );
    res.json({ message: 'Match updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update match', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM \`MATCH\` WHERE MatchID = ?', [req.params.id]);
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete match', status: 500 } });
  }
});

module.exports = router;
