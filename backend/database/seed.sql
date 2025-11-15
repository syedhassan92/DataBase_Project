-- Seed data for Sports Management System
USE sports_management_db;

-- Insert Coaches
INSERT INTO COACH (CoachID, CoachName, Contact, Experience) VALUES
('C001', 'John Smith', 'john.smith@email.com', 15),
('C002', 'Maria Garcia', 'maria.garcia@email.com', 12),
('C003', 'David Lee', 'david.lee@email.com', 10),
('C004', 'Sarah Johnson', 'sarah.johnson@email.com', 8),
('C005', 'Ahmed Hassan', 'ahmed.hassan@email.com', 6);

-- Insert Referees
INSERT INTO REFEREE (RefereeID, RefereeName, Contact, AvailabilityStatus) VALUES
('R001', 'Michael Brown', 'michael.brown@email.com', 'Available'),
('R002', 'Lisa Anderson', 'lisa.anderson@email.com', 'Available'),
('R003', 'James Wilson', 'james.wilson@email.com', 'Unavailable'),
('R004', 'Emma Davis', 'emma.davis@email.com', 'Available');

-- Insert Venues
INSERT INTO VENUE (VenueID, VenueName, Location, Capacity, IsAvailable) VALUES
('V001', 'Champions Stadium', 'New York, NY', 75000, TRUE),
('V002', 'Victory Arena', 'Los Angeles, CA', 65000, TRUE),
('V003', 'Sports Complex', 'Chicago, IL', 50000, TRUE),
('V004', 'Metro Field', 'Houston, TX', 45000, FALSE);

-- Insert Leagues
INSERT INTO LEAGUE (LeagueID, AdminID, LeagueName, StartDate, EndDate) VALUES
('L001', 'A001', 'Premier League 2024', '2024-01-01', '2024-12-31'),
('L002', 'A001', 'Championship League 2024', '2024-02-01', '2024-11-30');

-- Insert Tournaments
INSERT INTO TOURNAMENT (TournamentID, AdminID, TournamentName, StartDate, EndDate) VALUES
('T001', 'A001', 'Summer Cup 2024', '2024-06-01', '2024-08-31'),
('T002', 'A001', 'Winter Championship 2024', '2024-11-01', '2024-12-31');

-- Insert Teams
INSERT INTO TEAM (TeamID, LeagueID, CoachID, TeamName) VALUES
('TM001', 'L001', 'C001', 'Thunder FC'),
('TM002', 'L001', 'C002', 'Lightning United'),
('TM003', 'L001', 'C003', 'Storm Athletic'),
('TM004', 'L002', 'C004', 'Phoenix FC'),
('TM005', 'L002', 'C005', 'Dragons United');

-- Insert Team Stats
INSERT INTO TEAMSTATS (LeagueStatsID, LeagueID, TeamID, Wins, Losses, Draws, Points) VALUES
('LS001', 'L001', 'TM001', 15, 5, 8, 53),
('LS002', 'L001', 'TM002', 14, 6, 8, 50),
('LS003', 'L001', 'TM003', 12, 8, 8, 44),
('LS004', 'L002', 'TM004', 10, 5, 5, 35),
('LS005', 'L002', 'TM005', 8, 7, 5, 29);

-- Insert Tournament Teams
INSERT INTO TOURNAMENTTEAM (TournamentTeamID, TournamentID, TeamID) VALUES
('TT001', 'T001', 'TM001'),
('TT002', 'T001', 'TM002'),
('TT003', 'T001', 'TM003'),
('TT004', 'T002', 'TM004'),
('TT005', 'T002', 'TM005');

-- Insert Players
INSERT INTO PLAYER (PlayerID, TeamID, PlayerName, PlayerRole, ContractDetails) VALUES
('P001', 'TM001', 'Alex Rodriguez', 'Forward', 'Contract until 2026'),
('P002', 'TM001', 'James Carter', 'Midfielder', 'Contract until 2025'),
('P003', 'TM001', 'Tom Wilson', 'Defender', 'Contract until 2027'),
('P004', 'TM002', 'Mike Johnson', 'Forward', 'Contract until 2026'),
('P005', 'TM002', 'Chris Brown', 'Goalkeeper', 'Contract until 2025'),
('P006', 'TM003', 'David Martinez', 'Midfielder', 'Contract until 2026'),
('P007', 'TM003', 'Ryan Taylor', 'Defender', 'Contract until 2024'),
('P008', 'TM004', 'Kevin White', 'Forward', 'Contract until 2027'),
('P009', 'TM005', 'Daniel Green', 'Midfielder', 'Contract until 2025');

-- Insert Player Stats
INSERT INTO PLAYERSTATS (StatsID, PlayerID, MatchesPlayed, Wins, GoalsOrRuns, Assists, Rating) VALUES
('PS001', 'P001', 28, 18, 22, 8, 8.5),
('PS002', 'P002', 26, 17, 5, 12, 7.8),
('PS003', 'P003', 25, 16, 2, 3, 7.5),
('PS004', 'P004', 27, 15, 19, 6, 8.2),
('PS005', 'P005', 28, 16, 0, 0, 7.9),
('PS006', 'P006', 24, 13, 8, 10, 7.6),
('PS007', 'P007', 22, 12, 1, 2, 7.3),
('PS008', 'P008', 20, 9, 15, 5, 8.0),
('PS009', 'P009', 21, 7, 6, 7, 7.4);

-- Insert Matches
INSERT INTO MATCH (MatchID, LeagueID, TournamentID, VenueID, RefereeID, MatchDate, MatchTime, Team1Score, Team2Score, Status, WinnerTeamID, Highlights) VALUES
('M001', 'L001', NULL, 'V001', 'R001', '2024-03-15', '19:00:00', 2, 1, 'Completed', 'TM001', 'Exciting match with late winner'),
('M002', 'L001', NULL, 'V002', 'R002', '2024-03-20', '20:00:00', 1, 1, 'Completed', NULL, 'Draw with penalties on both sides'),
('M003', NULL, 'T001', 'V003', 'R004', '2024-06-15', '18:00:00', 3, 2, 'Completed', 'TM001', 'High scoring thriller'),
('M004', 'L002', NULL, 'V001', 'R001', '2024-04-10', '19:30:00', NULL, NULL, 'Scheduled', NULL, NULL),
('M005', NULL, 'T002', 'V002', 'R004', '2024-11-20', '20:00:00', NULL, NULL, 'Scheduled', NULL, NULL);

-- Insert Transfers
INSERT INTO TRANSFER (TransferID, LeagueID, FromTeamID, ToTeamID, TransferDate, TransferType) VALUES
('TR001', 'L001', 'TM003', 'TM001', '2024-01-15', 'Permanent'),
('TR002', 'L002', 'TM005', 'TM004', '2024-02-20', 'Loan');

-- Insert Transfer Details
INSERT INTO TRANSFERDETAILS (TransferDetailsID, TransferID, PlayerID) VALUES
('TD001', 'TR001', 'P006'),
('TD002', 'TR002', 'P009');
