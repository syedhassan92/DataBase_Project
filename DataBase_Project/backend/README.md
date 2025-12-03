# Sports Management System - Backend

Express.js REST API with MySQL database for managing sports leagues, tournaments, teams, and players.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory (already exists) and verify the settings:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sports_management_db
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE sports_management_db;
```

### 4. Run Database Schema

Execute the schema file to create all tables:

```bash
mysql -u root -p sports_management_db < database/schema.sql
```

Or in MySQL Workbench/command line:

```sql
USE sports_management_db;
SOURCE /path/to/backend/database/schema.sql;
```

### 5. Seed Database (Optional)

Populate the database with initial data:

```bash
mysql -u root -p sports_management_db < database/seed.sql
```

Or:

```sql
USE sports_management_db;
SOURCE /path/to/backend/database/seed.sql;
```

### 6. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (user or admin)
- `POST /api/auth/register` - Register new user

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/:id` - Get league by ID
- `POST /api/leagues` - Create league (admin only)
- `PUT /api/leagues/:id` - Update league (admin only)
- `DELETE /api/leagues/:id` - Delete league (admin only)

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament (admin only)
- `PUT /api/tournaments/:id` - Update tournament (admin only)
- `DELETE /api/tournaments/:id` - Delete tournament (admin only)

### Teams
- `GET /api/teams` - Get all teams (with coach and league info)
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team (admin only)
- `PUT /api/teams/:id` - Update team (admin only)
- `DELETE /api/teams/:id` - Delete team (admin only)

### Players
- `GET /api/players` - Get all players (with stats)
- `GET /api/players/:id` - Get player by ID
- `POST /api/players` - Create player (admin only)
- `PUT /api/players/:id` - Update player (admin only)
- `DELETE /api/players/:id` - Delete player (admin only)

### Coaches
- `GET /api/coaches` - Get all coaches
- `GET /api/coaches/:id` - Get coach by ID
- `POST /api/coaches` - Create coach (admin only)
- `PUT /api/coaches/:id` - Update coach (admin only)
- `DELETE /api/coaches/:id` - Delete coach (admin only)

### Referees
- `GET /api/referees` - Get all referees
- `GET /api/referees/:id` - Get referee by ID
- `POST /api/referees` - Create referee (admin only)
- `PUT /api/referees/:id` - Update referee (admin only)
- `DELETE /api/referees/:id` - Delete referee (admin only)

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get venue by ID
- `POST /api/venues` - Create venue (admin only)
- `PUT /api/venues/:id` - Update venue (admin only)
- `DELETE /api/venues/:id` - Delete venue (admin only)

### Matches
- `GET /api/matches` - Get all matches (with full relations)
- `GET /api/matches/:id` - Get match by ID
- `POST /api/matches` - Create match (admin only)
- `PUT /api/matches/:id` - Update match (admin only)
- `DELETE /api/matches/:id` - Delete match (admin only)

### Transfers
- `GET /api/transfers` - Get all transfers (with player details)
- `POST /api/transfers` - Create transfer (admin only)
- `DELETE /api/transfers/:id` - Delete transfer (admin only)

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/top-players` - Get top players by rating
- `GET /api/stats/standings/:leagueId` - Get team standings by league
- `GET /api/stats/recent-transfers` - Get recent transfers

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```
Authorization: Bearer <token>
```

### Default Credentials

**Admin:**
- Email: admin@sports.com
- Password: admin123

**User:**
- Email: user@sports.com
- Password: user123

## Database Schema

The system includes 17 tables:
1. USERACCOUNT - User authentication
2. ADMIN - Administrator details
3. COACH - Coach information
4. REFEREE - Referee details
5. LEAGUE - League management
6. TOURNAMENT - Tournament organization
7. TEAM - Team details
8. TEAMLEAGUE - Team-league-coach junction
9. LEAGUETEAMSTATS - Team statistics per league
10. TOURNAMENTTEAM - Tournament-team junction
11. TOURNAMENTTEAMSTATS - Team statistics per tournament
12. PLAYER - Player information
13. PLAYERTEAM - Player-team contract junction
14. PLAYERSTATS - Player statistics
15. VENUE - Venue details
16. MATCH - Match scheduling and results
17. MATCHSTATS - Match statistics
18. TRANSFER - Transfer records

## Error Handling

The API returns consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## Development

- Server auto-restarts on file changes (using nodemon)
- CORS enabled for frontend communication
- Connection pooling for database efficiency
- JWT authentication with role-based access control

## Troubleshooting

**Cannot connect to database:**
- Verify MySQL is running
- Check DB credentials in `.env`
- Ensure database exists

**Port already in use:**
- Change PORT in `.env` file
- Or stop the process using port 5000

**Authentication errors:**
- Verify JWT_SECRET is set in `.env`
- Check token is being sent in Authorization header

## License

ISC
