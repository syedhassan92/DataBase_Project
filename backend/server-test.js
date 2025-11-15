console.log(' Minimal server starting...');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log(' Starting listener...');
const server = app.listen(PORT, () => {
  console.log(' Server is ALIVE on port', PORT);
  console.log('Keep this terminal open!');
});

server.on('error', (err) => {
  console.error(' Server error:', err);
});

process.on('exit', (code) => {
  console.log('  Process exiting with code:', code);
});
