const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [coaches] = await db.query('SELECT * FROM COACH ORDER BY CreatedAt DESC');
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch coaches', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [coaches] = await db.query('SELECT * FROM COACH WHERE CoachID = ?', [req.params.id]);
    if (coaches.length === 0) {
      return res.status(404).json({ error: { message: 'Coach not found', status: 404 } });
    }
    res.json(coaches[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch coach', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { coachName, contact, experience } = req.body;
    const [result] = await db.query(
      'INSERT INTO COACH (CoachName, Contact, Experience) VALUES (?, ?, ?)',
      [coachName, contact || null, experience || 0]
    );
    res.status(201).json({ message: 'Coach created successfully', coachId: result.insertId });
  } catch (error) {
    console.error('Error creating coach:', error);
    res.status(500).json({ error: { message: 'Failed to create coach', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { coachName, contact, experience } = req.body;
    await db.query(
      'UPDATE COACH SET CoachName = ?, Contact = ?, Experience = ? WHERE CoachID = ?',
      [coachName, contact || null, experience || 0, req.params.id]
    );
    res.json({ message: 'Coach updated successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update coach', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM COACH WHERE CoachID = ?', [req.params.id]);
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete coach', status: 500 } });
  }
});

module.exports = router;
