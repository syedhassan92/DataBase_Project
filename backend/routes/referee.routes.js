const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [referees] = await db.query('SELECT * FROM REFEREE ORDER BY CreatedAt DESC');
    res.json(referees);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch referees', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [referees] = await db.query('SELECT * FROM REFEREE WHERE RefereeID = ?', [req.params.id]);
    if (referees.length === 0) {
      return res.status(404).json({ error: { message: 'Referee not found', status: 404 } });
    }
    res.json(referees[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch referee', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { refereeId, refereeName, contact, availabilityStatus } = req.body;
    await db.query(
      'INSERT INTO REFEREE (RefereeID, RefereeName, Contact, AvailabilityStatus) VALUES (?, ?, ?, ?)',
      [refereeId, refereeName, contact || null, availabilityStatus || 'Available']
    );
    res.status(201).json({ message: 'Referee created successfully', refereeId });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create referee', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { refereeName, contact, availabilityStatus } = req.body;
    await db.query(
      'UPDATE REFEREE SET RefereeName = ?, Contact = ?, AvailabilityStatus = ? WHERE RefereeID = ?',
      [refereeName, contact || null, availabilityStatus || 'Available', req.params.id]
    );
    res.json({ message: 'Referee updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update referee', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM REFEREE WHERE RefereeID = ?', [req.params.id]);
    res.json({ message: 'Referee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete referee', status: 500 } });
  }
});

module.exports = router;
