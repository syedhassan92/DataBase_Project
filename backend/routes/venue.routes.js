const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [venues] = await db.query('SELECT * FROM VENUE ORDER BY CreatedAt DESC');
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch venues', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [venues] = await db.query('SELECT * FROM VENUE WHERE VenueID = ?', [req.params.id]);
    if (venues.length === 0) {
      return res.status(404).json({ error: { message: 'Venue not found', status: 404 } });
    }
    res.json(venues[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch venue', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { venueName, location, capacity, isAvailable } = req.body;
    const [result] = await db.query(
      'INSERT INTO VENUE (VenueName, Location, Capacity, IsAvailable) VALUES (?, ?, ?, ?)',
      [venueName, location || null, capacity || null, isAvailable !== undefined ? isAvailable : true]
    );
    res.status(201).json({ message: 'Venue created successfully', venueId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to create venue', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { venueName, location, capacity, isAvailable } = req.body;
    await db.query(
      'UPDATE VENUE SET VenueName = ?, Location = ?, Capacity = ?, IsAvailable = ? WHERE VenueID = ?',
      [venueName, location || null, capacity || null, isAvailable !== undefined ? isAvailable : true, req.params.id]
    );
    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update venue', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM VENUE WHERE VenueID = ?', [req.params.id]);
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete venue', status: 500 } });
  }
});

module.exports = router;
