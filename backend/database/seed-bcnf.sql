-- Seed data for BCNF schema

USE sports_management_db;

-- Insert Coaches
INSERT INTO COACH (CoachName, Contact, Experience) VALUES
('John Smith', 'john.smith@email.com', 15),
('Maria Garcia', 'maria.garcia@email.com', 12),
('David Lee', 'david.lee@email.com', 10),
('Sarah Johnson', 'sarah.johnson@email.com', 8),
('Ahmed Hassan', 'ahmed.hassan@email.com', 6);

-- Insert Referees
INSERT INTO REFEREE (RefereeName, Contact, AvailabilityStatus) VALUES
('Michael Brown', 'michael.brown@email.com', 'Available'),
('Lisa Anderson', 'lisa.anderson@email.com', 'Available'),
('James Wilson', 'james.wilson@email.com', 'Unavailable'),
('Emma Davis', 'emma.davis@email.com', 'Available');

-- Insert Venues
INSERT INTO VENUE (VenueName, Location, Capacity, IsAvailable) VALUES
('Champions Stadium', 'New York, NY', 75000, TRUE),
('Victory Arena', 'Los Angeles, CA', 65000, TRUE),
('Sports Complex', 'Chicago, IL', 50000, TRUE),
('Metro Field', 'Houston, TX', 45000, FALSE);

-- Insert Leagues
INSERT INTO LEAGUE (AdminID, LeagueName, StartDate, EndDate) VALUES
(1, 'Premier League 2024', '2024-01-01', '2024-12-31'),
(1, 'Championship League 2024', '2024-02-01', '2024-11-30');

-- Insert Tournaments
INSERT INTO TOURNAMENT (AdminID, LeagueID, TournamentName, Description, StartDate, EndDate, Status) VALUES
(1, 1, 'Summer Cup 2024', 'Top four clubs battle for summer glory.', '2024-06-01', '2024-08-31', 'completed'),
(1, 2, 'Winter Championship 2024', 'Season finale with knockout rounds.', '2024-11-01', '2024-12-31', 'upcoming');

-- Insert Teams
INSERT INTO TEAM (TeamName) VALUES
('Thunder FC'),
('Lightning United'),
('Storm Athletic'),
('Phoenix FC'),
('Dragons United');

-- Associate Teams with Leagues and Coaches (TEAMLEAGUE)
INSERT INTO TEAMLEAGUE (TeamID, LeagueID, CoachID) VALUES
(1, 1, 1),  -- Thunder FC in Premier League with John Smith
(2, 1, 2),  -- Lightning United in Premier League with Maria Garcia
(3, 1, 3),  -- Storm Athletic in Premier League with David Lee
(4, 2, 4),  -- Phoenix FC in Championship with Sarah Johnson
(5, 2, 5);  -- Dragons United in Championship with Ahmed Hassan

-- Insert Team Stats
INSERT INTO TEAMSTATS (LeagueID, TeamID, Wins, Losses, Draws, Points) VALUES
(1, 1, 15, 5, 8, 53),
(1, 2, 14, 6, 8, 50),
(1, 3, 12, 8, 8, 44),
(2, 4, 10, 5, 5, 35),
(2, 5, 8, 7, 5, 29);

-- Associate Teams with Tournaments
INSERT INTO TOURNAMENTTEAM (TournamentID, TeamID) VALUES
(1, 1),  -- Thunder FC in Summer Cup
(1, 2),  -- Lightning United in Summer Cup
(1, 3),  -- Storm Athletic in Summer Cup
(2, 4),  -- Phoenix FC in Winter Championship
(2, 5);  -- Dragons United in Winter Championship

-- Insert Players
INSERT INTO PLAYER (PlayerName, PlayerRole) VALUES
('Alex Rodriguez', 'Forward'),
('James Carter', 'Midfielder'),
('Tom Wilson', 'Defender'),
('Mike Johnson', 'Forward'),
('Chris Brown', 'Goalkeeper'),
('David Martinez', 'Midfielder'),
('Ryan Taylor', 'Defender'),
('Kevin White', 'Forward'),
('Daniel Green', 'Midfielder');

-- Associate Players with Teams (PLAYERTEAM)
INSERT INTO PLAYERTEAM (PlayerID, TeamID, ContractDetails, StartDate, IsCurrent) VALUES
(1, 1, 'Contract until 2026', '2022-01-01', TRUE),
(2, 1, 'Contract until 2025', '2021-06-01', TRUE),
(3, 1, 'Contract until 2027', '2023-01-01', TRUE),
(4, 2, 'Contract until 2026', '2022-07-01', TRUE),
(5, 2, 'Contract until 2025', '2020-01-01', TRUE),
(6, 3, 'Contract until 2026', '2022-03-01', TRUE),
(7, 3, 'Contract until 2024', '2019-01-01', TRUE),
(8, 4, 'Contract until 2027', '2023-06-01', TRUE),
(9, 5, 'Contract until 2025', '2021-01-01', TRUE);

-- Insert Player Stats
INSERT INTO PLAYERSTATS (PlayerID, MatchesPlayed, Wins, GoalsOrRuns, Assists, Rating) VALUES
(1, 28, 18, 22, 8, 8.50),
(2, 26, 17, 5, 12, 7.80),
(3, 25, 16, 2, 3, 7.50),
(4, 27, 15, 19, 6, 8.20),
(5, 28, 16, 0, 0, 7.90),
(6, 24, 13, 8, 10, 7.60),
(7, 22, 12, 1, 2, 7.30),
(8, 20, 9, 15, 5, 8.00),
(9, 21, 7, 6, 7, 7.40);

-- Insert Matches (with Team1ID and Team2ID)
INSERT INTO `MATCH` (LeagueID, TournamentID, Team1ID, Team2ID, VenueID, RefereeID, MatchDate, MatchTime, Team1Score, Team2Score, Status, WinnerTeamID, Highlights) VALUES
(1, NULL, 1, 2, 1, 1, '2024-03-15', '19:00:00', 2, 1, 'Completed', 1, 'Exciting match with late winner'),
(1, NULL, 2, 3, 2, 2, '2024-03-20', '20:00:00', 1, 1, 'Completed', NULL, 'Draw with penalties on both sides'),
(NULL, 1, 1, 3, 3, 4, '2024-06-15', '18:00:00', 3, 2, 'Completed', 1, 'High scoring thriller'),
(2, NULL, 4, 5, 1, 1, '2024-04-10', '19:30:00', NULL, NULL, 'Scheduled', NULL, NULL),
(NULL, 2, 4, 5, 2, 4, '2024-11-20', '20:00:00', NULL, NULL, 'Scheduled', NULL, NULL);

-- Insert Transfers (simplified - direct player reference)
INSERT INTO TRANSFER (PlayerID, FromTeamID, ToTeamID, LeagueID, TransferDate, TransferType) VALUES
(6, 3, 1, 1, '2024-01-15', 'Permanent'),
(9, 5, 4, 2, '2024-02-20', 'Loan');
