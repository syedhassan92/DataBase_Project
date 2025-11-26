-- Sports Management Database - Complete Setup (BCNF Compliant)
-- Run this file in phpMyAdmin to create database, tables, and seed data

DROP DATABASE IF EXISTS sports_management_db;
CREATE DATABASE sports_management_db;
USE sports_management_db;

-- USERACCOUNT Table (BCNF: UserID is the only determinant)
CREATE TABLE USERACCOUNT (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('User', 'Admin') NOT NULL DEFAULT 'User',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADMIN Table (BCNF: Removed redundant Password, UserID determines all attributes)
CREATE TABLE ADMIN (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    AdminName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES USERACCOUNT(UserID) ON DELETE CASCADE
);

-- COACH Table (BCNF: CoachID determines all attributes)
CREATE TABLE COACH (
    CoachID INT AUTO_INCREMENT PRIMARY KEY,
    CoachName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Experience INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REFEREE Table (BCNF: RefereeID determines all attributes)
CREATE TABLE REFEREE (
    RefereeID INT AUTO_INCREMENT PRIMARY KEY,
    RefereeName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    AvailabilityStatus ENUM('Available', 'Unavailable') DEFAULT 'Available',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LEAGUE Table (BCNF: LeagueID determines all attributes)
CREATE TABLE LEAGUE (
    LeagueID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    LeagueName VARCHAR(100) NOT NULL,
    StartDate DATE,
    EndDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID) ON DELETE CASCADE
);

-- TOURNAMENT Table (BCNF: TournamentID determines all attributes)
CREATE TABLE TOURNAMENT (
    TournamentID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    LeagueID INT NULL,
    TournamentName VARCHAR(100) NOT NULL,
    Description TEXT,
    StartDate DATE,
    EndDate DATE,
    Status ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID) ON DELETE CASCADE,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE SET NULL
);

-- TEAM Table (BCNF: TeamID determines all attributes)
CREATE TABLE TEAM (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TEAMLEAGUE Table (New: Associates teams with leagues and coaches - BCNF)
-- A team can participate in multiple leagues, but each coach can only coach ONE team
-- LeagueID is required (NOT NULL), CoachID is optional
CREATE TABLE TEAMLEAGUE (
    TeamLeagueID INT AUTO_INCREMENT PRIMARY KEY,
    TeamID INT NOT NULL,
    LeagueID INT NOT NULL,
    CoachID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    FOREIGN KEY (CoachID) REFERENCES COACH(CoachID) ON DELETE SET NULL,
    UNIQUE KEY unique_team_league (TeamID, LeagueID),
    UNIQUE KEY unique_coach (CoachID)
);

-- TEAMSTATS Table (BCNF: Natural key (LeagueID, TeamID) as primary key)
CREATE TABLE TEAMSTATS (
    LeagueID INT NOT NULL,
    TeamID INT NOT NULL,
    Wins INT DEFAULT 0,
    Losses INT DEFAULT 0,
    Draws INT DEFAULT 0,
    Points INT DEFAULT 0,
    GoalsFor INT DEFAULT 0,
    GoalDifference INT DEFAULT 0,
    MatchesPlayed INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (LeagueID, TeamID),
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE
);

-- Trigger to automatically populate TEAMSTATS when team is added to league
DELIMITER //
CREATE TRIGGER after_teamleague_insert
AFTER INSERT ON TEAMLEAGUE
FOR EACH ROW
BEGIN
    INSERT INTO TEAMSTATS 
    (LeagueID, TeamID, Wins, Losses, Draws, Points, GoalsFor, GoalDifference, MatchesPlayed)
    VALUES (NEW.LeagueID, NEW.TeamID, 0, 0, 0, 0, 0, 0, 0)
    ON DUPLICATE KEY UPDATE LeagueID = NEW.LeagueID;
END//
DELIMITER ;

-- TOURNAMENTTEAM Junction Table (BCNF: Natural key as primary key)
CREATE TABLE TOURNAMENTTEAM (
    TournamentID INT NOT NULL,
    TeamID INT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (TournamentID, TeamID),
    FOREIGN KEY (TournamentID) REFERENCES TOURNAMENT(TournamentID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE
);

-- PLAYER Table (BCNF: PlayerID determines all attributes)
CREATE TABLE PLAYER (
    PlayerID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerName VARCHAR(100) NOT NULL,
    PlayerRole VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PLAYERTEAM Table (New: Associates players with teams and contract details)
CREATE TABLE PLAYERTEAM (
    PlayerTeamID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT NOT NULL,
    TeamID INT NOT NULL,
    ContractDetails TEXT,
    StartDate DATE,
    EndDate DATE,
    IsCurrent BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlayerID) REFERENCES PLAYER(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    UNIQUE KEY unique_current_player (PlayerID, IsCurrent)
);

-- PLAYERSTATS Table (BCNF: StatsID determines all attributes)
CREATE TABLE PLAYERSTATS (
    StatsID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT NOT NULL,
    MatchID INT NOT NULL,
    LeagueID INT NOT NULL,
    MatchesPlayed INT DEFAULT 0,
    Wins INT DEFAULT 0,
    Goals INT DEFAULT 0,
    Assists INT DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlayerID) REFERENCES PLAYER(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (MatchID) REFERENCES `MATCH`(MatchID) ON DELETE CASCADE,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE
);

-- VENUE Table (BCNF: VenueID determines all attributes)
CREATE TABLE VENUE (
    VenueID INT AUTO_INCREMENT PRIMARY KEY,
    VenueName VARCHAR(100) NOT NULL,
    Location VARCHAR(200),
    Capacity INT,
    IsAvailable BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MATCH Table (BCNF: MatchID determines all attributes)
CREATE TABLE `MATCH` (
    MatchID INT AUTO_INCREMENT PRIMARY KEY,
    LeagueID INT,
    TournamentID INT,
    Team1ID INT NOT NULL,
    Team2ID INT NOT NULL,
    VenueID INT,
    RefereeID INT,
    MatchDate DATE,
    MatchTime TIME,
    Team1Score INT DEFAULT 0,
    Team2Score INT DEFAULT 0,
    Status ENUM('Scheduled', 'Live', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    WinnerTeamID INT,
    Highlights TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    FOREIGN KEY (TournamentID) REFERENCES TOURNAMENT(TournamentID) ON DELETE CASCADE,
    FOREIGN KEY (Team1ID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (Team2ID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (VenueID) REFERENCES VENUE(VenueID) ON DELETE SET NULL,
    FOREIGN KEY (RefereeID) REFERENCES REFEREE(RefereeID) ON DELETE SET NULL,
    FOREIGN KEY (WinnerTeamID) REFERENCES TEAM(TeamID) ON DELETE SET NULL,
    CHECK (Team1ID != Team2ID),
    CHECK ((LeagueID IS NOT NULL AND TournamentID IS NULL) OR (LeagueID IS NULL AND TournamentID IS NOT NULL))
);

-- MATCHSTATS Table (BCNF: MatchStatsID determines all attributes)
CREATE TABLE MATCHSTATS (
    MatchStatsID INT AUTO_INCREMENT PRIMARY KEY,
    MatchID INT NOT NULL,
    TeamID INT NOT NULL,
    Score INT DEFAULT 0,
    Possession INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MatchID) REFERENCES `MATCH`(MatchID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    UNIQUE KEY unique_match_team (MatchID, TeamID)
);

-- TRANSFER Table (BCNF: TransferID determines all attributes)
CREATE TABLE TRANSFER (
    TransferID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT NOT NULL,
    FromTeamID INT,
    ToTeamID INT NOT NULL,
    LeagueID INT NOT NULL,
    TransferDate DATE,
    TransferType ENUM('Loan', 'Permanent') DEFAULT 'Permanent',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlayerID) REFERENCES PLAYER(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (FromTeamID) REFERENCES TEAM(TeamID) ON DELETE SET NULL,
    FOREIGN KEY (ToTeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    CHECK (FromTeamID != ToTeamID)
);

-- Trigger to automatically update TEAMSTATS when a match is completed
DELIMITER //
CREATE TRIGGER after_match_update
AFTER UPDATE ON `MATCH`
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' AND NEW.LeagueID IS NOT NULL THEN
        UPDATE TEAMSTATS
        SET 
            MatchesPlayed = MatchesPlayed + 1,
            GoalsFor = GoalsFor + NEW.Team1Score,
            GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
            Wins = Wins + CASE WHEN NEW.Team1Score > NEW.Team2Score THEN 1 ELSE 0 END,
            Draws = Draws + CASE WHEN NEW.Team1Score = NEW.Team2Score THEN 1 ELSE 0 END,
            Losses = Losses + CASE WHEN NEW.Team1Score < NEW.Team2Score THEN 1 ELSE 0 END,
            Points = Points + CASE WHEN NEW.Team1Score > NEW.Team2Score THEN 3 WHEN NEW.Team1Score = NEW.Team2Score THEN 1 ELSE 0 END
        WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team1ID;
        
        UPDATE TEAMSTATS
        SET 
            MatchesPlayed = MatchesPlayed + 1,
            GoalsFor = GoalsFor + NEW.Team2Score,
            GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
            Wins = Wins + CASE WHEN NEW.Team2Score > NEW.Team1Score THEN 1 ELSE 0 END,
            Draws = Draws + CASE WHEN NEW.Team2Score = NEW.Team1Score THEN 1 ELSE 0 END,
            Losses = Losses + CASE WHEN NEW.Team2Score < NEW.Team1Score THEN 1 ELSE 0 END,
            Points = Points + CASE WHEN NEW.Team2Score > NEW.Team1Score THEN 3 WHEN NEW.Team2Score = NEW.Team1Score THEN 1 ELSE 0 END
        WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team2ID;
    END IF;
END//
DELIMITER ;

-- Trigger to prevent a player from joining multiple teams simultaneously
DELIMITER //
CREATE TRIGGER before_playerteam_insert
BEFORE INSERT ON PLAYERTEAM
FOR EACH ROW
BEGIN
  IF NEW.IsCurrent = TRUE THEN
    IF EXISTS (
      SELECT 1 FROM PLAYERTEAM 
      WHERE PlayerID = NEW.PlayerID 
      AND IsCurrent = TRUE
    ) THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Player is already assigned to a current team';
    END IF;
  END IF;
END//

CREATE TRIGGER before_playerteam_update
BEFORE UPDATE ON PLAYERTEAM
FOR EACH ROW
BEGIN
  IF NEW.IsCurrent = TRUE AND OLD.IsCurrent = FALSE THEN
    IF EXISTS (
      SELECT 1 FROM PLAYERTEAM 
      WHERE PlayerID = NEW.PlayerID 
      AND IsCurrent = TRUE
      AND PlayerTeamID != NEW.PlayerTeamID
    ) THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Player is already assigned to a current team';
    END IF;
  END IF;
END//
DELIMITER ;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default accounts
INSERT INTO USERACCOUNT (Username, Password, Role) VALUES 
('admin', 'admin123', 'Admin'),
('user', 'user123', 'User');

INSERT INTO ADMIN (UserID, AdminName, Email) VALUES 
(1, 'System Admin', 'admin@sports.com');

-- Insert Coaches
INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES
('John Smith', '+1-555-0101', 'john.smith@email.com', 15),
('Maria Garcia', '+1-555-0102', 'maria.garcia@email.com', 12),
('David Lee', '+1-555-0103', 'david.lee@email.com', 10),
('Sarah Johnson', '+1-555-0104', 'sarah.johnson@email.com', 8),
('Ahmed Hassan', '+1-555-0105', 'ahmed.hassan@email.com', 6);

-- Insert Referees
INSERT INTO REFEREE (RefereeName, PhoneNumber, Email, AvailabilityStatus) VALUES
('Michael Brown', '+1-555-0201', 'michael.brown@email.com', 'Available'),
('Lisa Anderson', '+1-555-0202', 'lisa.anderson@email.com', 'Available'),
('James Wilson', '+1-555-0203', 'james.wilson@email.com', 'Unavailable'),
('Emma Davis', '+1-555-0204', 'emma.davis@email.com', 'Available');

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

-- Team Stats are automatically created by the after_teamleague_insert trigger
-- Update team stats with actual values
UPDATE TEAMSTATS SET Wins = 15, Losses = 5, Draws = 8, Points = 53 WHERE LeagueID = 1 AND TeamID = 1;
UPDATE TEAMSTATS SET Wins = 14, Losses = 6, Draws = 8, Points = 50 WHERE LeagueID = 1 AND TeamID = 2;
UPDATE TEAMSTATS SET Wins = 12, Losses = 8, Draws = 8, Points = 44 WHERE LeagueID = 1 AND TeamID = 3;
UPDATE TEAMSTATS SET Wins = 10, Losses = 5, Draws = 5, Points = 35 WHERE LeagueID = 2 AND TeamID = 4;
UPDATE TEAMSTATS SET Wins = 8, Losses = 7, Draws = 5, Points = 29 WHERE LeagueID = 2 AND TeamID = 5;

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

INSERT INTO PLAYERSTATS (PlayerID, MatchID, LeagueID, MatchesPlayed, Wins, Goals, Assists, Rating) VALUES
(1, 1, 1, 28, 18, 22, 8, 8.50),
(2, 2, 1, 26, 17, 5, 12, 7.80),
(3, 3, 1, 25, 16, 2, 3, 7.50),
(4, 4, 2, 27, 15, 19, 6, 8.20),
(5, 5, 2, 28, 16, 0, 0, 7.90),
(6, 1, 1, 24, 13, 8, 10, 7.60),
(7, 2, 1, 22, 12, 1, 2, 7.30),
(8, 3, 2, 20, 9, 15, 5, 8.00),
(9, 4, 2, 21, 7, 6, 7, 7.40);

-- Insert Matches (with Team1ID and Team2ID)
INSERT INTO `MATCH` (LeagueID, TournamentID, Team1ID, Team2ID, VenueID, RefereeID, MatchDate, MatchTime, Team1Score, Team2Score, Status, WinnerTeamID, Highlights) VALUES
(1, NULL, 1, 2, 1, 1, '2024-03-15', '19:00:00', 2, 1, 'Completed', 1, 'Exciting match with late winner'),
(1, NULL, 2, 3, 2, 2, '2024-03-20', '20:00:00', 1, 1, 'Completed', NULL, 'Draw with penalties on both sides'),
(NULL, 1, 1, 3, 3, 4, '2024-06-15', '18:00:00', 3, 2, 'Completed', 1, 'High scoring thriller'),
(2, NULL, 4, 5, 1, 1, '2024-04-10', '19:30:00', 0, 0, 'Scheduled', NULL, NULL),
(NULL, 2, 4, 5, 2, 4, '2024-11-20', '20:00:00', 0, 0, 'Scheduled', NULL, NULL);

-- Insert Transfers (simplified - direct player reference)
INSERT INTO TRANSFER (PlayerID, FromTeamID, ToTeamID, LeagueID, TransferDate, TransferType) VALUES
(6, 3, 1, 1, '2024-01-15', 'Permanent'),
(9, 5, 4, 2, '2024-02-20', 'Loan');
