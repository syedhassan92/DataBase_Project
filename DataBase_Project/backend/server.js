console.log(' Server file is loading...');
const express = require('express');
const cors = require('cors');
const db = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/teams', require('./routes/team.routes'));
app.use('/api/leagues', require('./routes/league.routes'));
app.use('/api/tournaments', require('./routes/tournament.routes'));
app.use('/api/players', require('./routes/player.routes'));
app.use('/api/coaches', require('./routes/coach.routes'));
app.use('/api/referees', require('./routes/referee.routes'));
app.use('/api/venues', require('./routes/venue.routes'));
app.use('/api/matches', require('./routes/match.routes'));
app.use('/api/transfers', require('./routes/transfer.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/player-contracts', require('./routes/playerContract.routes'));
app.use('/api/users', require('./routes/user.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

console.log(' Starting server...');
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(' Server is running on port', PORT);
  console.log(' API available at http://localhost:' + PORT + '/api');
  console.log(' Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:3000');
});

server.on('error', (err) => {
  console.error(' Failed to start server:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(' Port', PORT, 'is already in use');
  }
  process.exit(1);
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log(' SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log(' HTTP server closed');
  });
});

module.exports = app;
