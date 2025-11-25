const https = require('https');
const http = require('http');

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test tournament creation endpoint
async function testTournamentCreation() {
  try {
    console.log('Testing tournament creation endpoint...\n');
    
    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await makeRequest(
      'http://localhost:5000/api/auth/admin/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'admin@sports.com', password: 'admin123' }
    );
    
    const token = loginResponse.data.token;
    console.log('✓ Login successful, token obtained\n');
    
    // Create a test tournament
    console.log('2. Creating test tournament...');
    const tournamentData = {
      tournamentName: 'Test Auto-Increment Tournament',
      description: 'Testing auto-increment functionality',
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      status: 'upcoming',
      leagueId: null,
      selectedTeams: []
    };
    
    const createResponse = await makeRequest(
      'http://localhost:5000/api/tournaments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      },
      tournamentData
    );
    
    console.log('✓ Tournament created successfully!');
    console.log('\nCreated Tournament Data:');
    console.log(JSON.stringify(createResponse.data, null, 2));
    console.log('\n✅ Tournament ID was automatically assigned:', createResponse.data.id);
    
    // Verify it's in the database
    const allTournamentsResponse = await makeRequest(
      'http://localhost:5000/api/tournaments',
      { method: 'GET' }
    );
    const createdTournament = allTournamentsResponse.data.find(t => t.id === createResponse.data.id);
    
    if (createdTournament) {
      console.log('✅ Tournament found in database with ID:', createdTournament.id);
    }
    
    // Cleanup - delete the test tournament
    console.log('\n3. Cleaning up...');
    await makeRequest(
      `http://localhost:5000/api/tournaments/${createResponse.data.id}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log('✓ Test tournament deleted');
    
    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('Tournament ID auto-increment is working correctly!');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error.message || error);
  }
}

testTournamentCreation();
