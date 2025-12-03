-- Sports Management Database - Complete Setup (BCNF Compliant)
-- Run this file in phpMyAdmin to create database, tables, and seed data

DROP DATABASE IF EXISTS sports_management_db;
CREATE DATABASE sports_management_db;
USE sports_management_db;

-- USERACCOUNT Table (BCNF: UserID is the only determinant)
CREATE TABLE USERACCOUNT (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('User', 'Admin') NOT NULL DEFAULT 'User',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

-- ADMIN Table (BCNF: UserID determines all attributes)
CREATE TABLE ADMIN (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    AdminName VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES USERACCOUNT(UserID) ON DELETE CASCADE
)
ENGINE=InnoDB;

-- COACH Table (BCNF: CoachID determines all attributes)
CREATE TABLE COACH (
    CoachID INT AUTO_INCREMENT PRIMARY KEY,
    CoachName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    Experience INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

-- REFEREE Table (BCNF: RefereeID determines all attributes)
CREATE TABLE REFEREE (
    RefereeID INT AUTO_INCREMENT PRIMARY KEY,
    RefereeName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20) UNIQUE,
    Email VARCHAR(100) UNIQUE,
    AvailabilityStatus ENUM('Available', 'Unavailable') DEFAULT 'Available',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

-- LEAGUE Table (BCNF: LeagueID determines all attributes)
CREATE TABLE LEAGUE (
    LeagueID INT AUTO_INCREMENT PRIMARY KEY,
    AdminID INT NOT NULL,
    LeagueName VARCHAR(100) NOT NULL,
    StartDate DATE,
    EndDate DATE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID) ON DELETE CASCADE,
    CHECK (EndDate >= StartDate)
)
ENGINE=InnoDB;

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
)
ENGINE=InnoDB;

-- TEAM Table (BCNF: TeamID determines all attributes)
CREATE TABLE TEAM (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

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
)
ENGINE=InnoDB;

-- LEAGUETEAMSTATS Table (BCNF: Natural key (LeagueID, TeamID) as primary key)
CREATE TABLE LEAGUETEAMSTATS (
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
)
ENGINE=InnoDB;

-- Trigger to automatically populate LEAGUETEAMSTATS when team is added to league
DELIMITER //
DROP TRIGGER IF EXISTS after_teamleague_insert//
CREATE TRIGGER after_teamleague_insert
AFTER INSERT ON TEAMLEAGUE
FOR EACH ROW
BEGIN
    INSERT INTO LEAGUETEAMSTATS 
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
)
ENGINE=InnoDB;

-- TOURNAMENTTEAMSTATS Table (BCNF: Natural key (TournamentID, TeamID) as primary key)
CREATE TABLE TOURNAMENTTEAMSTATS (
    TournamentID INT NOT NULL,
    TeamID INT NOT NULL,
    Wins INT DEFAULT 0,
    Losses INT DEFAULT 0,
    Draws INT DEFAULT 0,
    Points INT DEFAULT 0,
    GoalsFor INT DEFAULT 0,
    GoalDifference INT DEFAULT 0,
    MatchesPlayed INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (TournamentID, TeamID),
    FOREIGN KEY (TournamentID) REFERENCES TOURNAMENT(TournamentID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE
)
ENGINE=InnoDB;

-- Trigger to automatically populate TOURNAMENTTEAMSTATS when team is added to tournament
DELIMITER //
DROP TRIGGER IF EXISTS after_tournamentteam_insert//
CREATE TRIGGER after_tournamentteam_insert
AFTER INSERT ON TOURNAMENTTEAM
FOR EACH ROW
BEGIN
    INSERT INTO TOURNAMENTTEAMSTATS 
    (TournamentID, TeamID, Wins, Losses, Draws, Points, GoalsFor, GoalDifference, MatchesPlayed)
    VALUES (NEW.TournamentID, NEW.TeamID, 0, 0, 0, 0, 0, 0, 0)
    ON DUPLICATE KEY UPDATE TournamentID = NEW.TournamentID;
END//
DELIMITER ;

-- PLAYER Table (BCNF: PlayerID determines all attributes)
CREATE TABLE PLAYER (
    PlayerID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerName VARCHAR(100) NOT NULL,
    PlayerRole VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

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
)
ENGINE=InnoDB;

-- VENUE Table (BCNF: VenueID determines all attributes)
CREATE TABLE VENUE (
    VenueID INT AUTO_INCREMENT PRIMARY KEY,
    VenueName VARCHAR(100) NOT NULL,
    Location VARCHAR(200),
    Capacity INT,
    IsAvailable BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

-- MATCH Table (BCNF: MatchID determines all attributes)
-- Note: Either LeagueID OR TournamentID must be filled (not both, not neither)
CREATE TABLE `MATCH` (
    MatchID INT AUTO_INCREMENT PRIMARY KEY,
    LeagueID INT DEFAULT NULL,
    TournamentID INT DEFAULT NULL,
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
    CHECK (WinnerTeamID IS NULL OR WinnerTeamID = Team1ID OR WinnerTeamID = Team2ID),
    CHECK ((LeagueID IS NOT NULL AND TournamentID IS NULL) OR (LeagueID IS NULL AND TournamentID IS NOT NULL)),
    CHECK (
        (Status = 'Completed' AND WinnerTeamID IS NULL AND Team1Score = Team2Score) OR
        (Status = 'Completed' AND WinnerTeamID = Team1ID AND Team1Score > Team2Score) OR
        (Status = 'Completed' AND WinnerTeamID = Team2ID AND Team2Score > Team1Score) OR
        (Status IN ('Scheduled', 'Live', 'Cancelled'))
    )
)
ENGINE=InnoDB;

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
)
ENGINE=InnoDB;

-- PLAYERSTATS Table (BCNF: StatsID determines all attributes)
-- Note: Either LeagueID OR TournamentID must be filled (not both, not neither)
CREATE TABLE PLAYERSTATS (
    StatsID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT NOT NULL,
    MatchID INT NOT NULL,
    LeagueID INT DEFAULT NULL,
    TournamentID INT DEFAULT NULL,
    MatchesPlayed INT DEFAULT 0,
    Wins INT DEFAULT 0,
    Goals INT DEFAULT 0,
    Assists INT DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlayerID) REFERENCES PLAYER(PlayerID) ON DELETE CASCADE,
    FOREIGN KEY (MatchID) REFERENCES `MATCH`(MatchID) ON DELETE CASCADE,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    FOREIGN KEY (TournamentID) REFERENCES TOURNAMENT(TournamentID) ON DELETE CASCADE,
    CHECK ((LeagueID IS NOT NULL AND TournamentID IS NULL) OR (LeagueID IS NULL AND TournamentID IS NOT NULL))
)
ENGINE=InnoDB;

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
)
ENGINE=InnoDB;

-- Trigger to automatically update LEAGUETEAMSTATS/TOURNAMENTTEAMSTATS when a match is inserted as completed
DELIMITER //
DROP TRIGGER IF EXISTS after_match_insert//
CREATE TRIGGER after_match_insert
AFTER INSERT ON `MATCH`
FOR EACH ROW
BEGIN
    DECLARE team1_points INT;
    DECLARE team2_points INT;
    DECLARE team1_wins INT;
    DECLARE team1_draws INT;
    DECLARE team1_losses INT;
    DECLARE team2_wins INT;
    DECLARE team2_draws INT;
    DECLARE team2_losses INT;
    
    -- Only proceed if match is inserted with completed status
    IF NEW.Status = 'Completed' THEN
        
        -- Calculate results once
        IF NEW.Team1Score > NEW.Team2Score THEN
            SET team1_wins = 1, team1_draws = 0, team1_losses = 0, team1_points = 3;
            SET team2_wins = 0, team2_draws = 0, team2_losses = 1, team2_points = 0;
        ELSEIF NEW.Team1Score = NEW.Team2Score THEN
            SET team1_wins = 0, team1_draws = 1, team1_losses = 0, team1_points = 1;
            SET team2_wins = 0, team2_draws = 1, team2_losses = 0, team2_points = 1;
        ELSE
            SET team1_wins = 0, team1_draws = 0, team1_losses = 1, team1_points = 0;
            SET team2_wins = 1, team2_draws = 0, team2_losses = 0, team2_points = 3;
        END IF;
        
        -- Update league stats if match is part of a league
        IF NEW.LeagueID IS NOT NULL THEN
            -- Update Team1 league stats
            UPDATE LEAGUETEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team1Score,
                GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
                Wins = Wins + team1_wins,
                Draws = Draws + team1_draws,
                Losses = Losses + team1_losses,
                Points = Points + team1_points
            WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team1ID;
            
            -- Update Team2 league stats
            UPDATE LEAGUETEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team2Score,
                GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
                Wins = Wins + team2_wins,
                Draws = Draws + team2_draws,
                Losses = Losses + team2_losses,
                Points = Points + team2_points
            WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team2ID;
        END IF;
        
        -- Update tournament stats if match is part of a tournament
        IF NEW.TournamentID IS NOT NULL THEN
            -- Update Team1 tournament stats
            UPDATE TOURNAMENTTEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team1Score,
                GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
                Wins = Wins + team1_wins,
                Draws = Draws + team1_draws,
                Losses = Losses + team1_losses,
                Points = Points + team1_points
            WHERE TournamentID = NEW.TournamentID AND TeamID = NEW.Team1ID;
            
            -- Update Team2 tournament stats
            UPDATE TOURNAMENTTEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team2Score,
                GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
                Wins = Wins + team2_wins,
                Draws = Draws + team2_draws,
                Losses = Losses + team2_losses,
                Points = Points + team2_points
            WHERE TournamentID = NEW.TournamentID AND TeamID = NEW.Team2ID;
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger to automatically update LEAGUETEAMSTATS when a match is updated to completed
DELIMITER //
DROP TRIGGER IF EXISTS before_match_update//
CREATE TRIGGER before_match_update
BEFORE UPDATE ON `MATCH`
FOR EACH ROW
BEGIN
  -- Validate that completed matches cannot be in the future
  IF NEW.Status = 'Completed' THEN
    -- Check if match date is in the future
    IF NEW.MatchDate > CURDATE() THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot mark a future match as Completed. Match date must be today or in the past.';
    END IF;
    
    -- Check if match is today but time is in the future
    IF NEW.MatchDate = CURDATE() AND NEW.MatchTime > CURTIME() THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot mark a match as Completed before its scheduled time.';
    END IF;
    
    -- Validate VenueID and RefereeID for Completed matches
    IF NEW.VenueID IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot update match to completed: VenueID cannot be null for completed matches.';
    END IF;
    IF NEW.RefereeID IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot update match to completed: RefereeID cannot be null for completed matches.';
    END IF;
  END IF;
END//

DROP TRIGGER IF EXISTS after_match_update//
CREATE TRIGGER after_match_update
AFTER UPDATE ON `MATCH`
FOR EACH ROW
BEGIN
    DECLARE team1_points INT;
    DECLARE team2_points INT;
    DECLARE team1_wins INT;
    DECLARE team1_draws INT;
    DECLARE team1_losses INT;
    DECLARE team2_wins INT;
    DECLARE team2_draws INT;
    DECLARE team2_losses INT;
    
    -- Only proceed if match just completed
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' THEN
        
        -- Calculate results once
        IF NEW.Team1Score > NEW.Team2Score THEN
            SET team1_wins = 1, team1_draws = 0, team1_losses = 0, team1_points = 3;
            SET team2_wins = 0, team2_draws = 0, team2_losses = 1, team2_points = 0;
        ELSEIF NEW.Team1Score = NEW.Team2Score THEN
            SET team1_wins = 0, team1_draws = 1, team1_losses = 0, team1_points = 1;
            SET team2_wins = 0, team2_draws = 1, team2_losses = 0, team2_points = 1;
        ELSE
            SET team1_wins = 0, team1_draws = 0, team1_losses = 1, team1_points = 0;
            SET team2_wins = 1, team2_draws = 0, team2_losses = 0, team2_points = 3;
        END IF;
        
        -- Update league stats if match is part of a league
        IF NEW.LeagueID IS NOT NULL THEN
            -- Update Team1 league stats
            UPDATE LEAGUETEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team1Score,
                GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
                Wins = Wins + team1_wins,
                Draws = Draws + team1_draws,
                Losses = Losses + team1_losses,
                Points = Points + team1_points
            WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team1ID;
            
            -- Update Team2 league stats
            UPDATE LEAGUETEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team2Score,
                GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
                Wins = Wins + team2_wins,
                Draws = Draws + team2_draws,
                Losses = Losses + team2_losses,
                Points = Points + team2_points
            WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team2ID;
        END IF;
        
        -- Update tournament stats if match is part of a tournament
        IF NEW.TournamentID IS NOT NULL THEN
            -- Update Team1 tournament stats
            UPDATE TOURNAMENTTEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team1Score,
                GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
                Wins = Wins + team1_wins,
                Draws = Draws + team1_draws,
                Losses = Losses + team1_losses,
                Points = Points + team1_points
            WHERE TournamentID = NEW.TournamentID AND TeamID = NEW.Team1ID;
            
            -- Update Team2 tournament stats
            UPDATE TOURNAMENTTEAMSTATS
            SET 
                MatchesPlayed = MatchesPlayed + 1,
                GoalsFor = GoalsFor + NEW.Team2Score,
                GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
                Wins = Wins + team2_wins,
                Draws = Draws + team2_draws,
                Losses = Losses + team2_losses,
                Points = Points + team2_points
            WHERE TournamentID = NEW.TournamentID AND TeamID = NEW.Team2ID;
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger to prevent a player from joining multiple teams simultaneously
DELIMITER //
DROP TRIGGER IF EXISTS before_playerteam_insert//
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

DROP TRIGGER IF EXISTS before_playerteam_update//
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

-- Trigger to enforce single admin constraint
DELIMITER //
DROP TRIGGER IF EXISTS before_admin_insert//
CREATE TRIGGER before_admin_insert
BEFORE INSERT ON ADMIN
FOR EACH ROW
BEGIN
  IF (SELECT COUNT(*) FROM ADMIN) >= 1 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Only one admin account is allowed in the system';
  END IF;
END//
DELIMITER ;

-- Trigger to enforce minimum 11 players per team when creating a match
DELIMITER //
DROP TRIGGER IF EXISTS before_match_insert//
CREATE TRIGGER before_match_insert
BEFORE INSERT ON `MATCH`
FOR EACH ROW
BEGIN
  DECLARE team1_player_count INT;
  DECLARE team2_player_count INT;
  DECLARE team1_name VARCHAR(100);
  DECLARE team2_name VARCHAR(100);
  DECLARE error_msg VARCHAR(500);
  DECLARE current_datetime DATETIME;
  DECLARE match_datetime DATETIME;
  
  -- Count current players for Team1
  SELECT COUNT(*) INTO team1_player_count
  FROM PLAYERTEAM
  WHERE TeamID = NEW.Team1ID AND IsCurrent = TRUE;
  
  -- Count current players for Team2
  SELECT COUNT(*) INTO team2_player_count
  FROM PLAYERTEAM
  WHERE TeamID = NEW.Team2ID AND IsCurrent = TRUE;
  
  -- Get team names
  SELECT TeamName INTO team1_name FROM TEAM WHERE TeamID = NEW.Team1ID;
  SELECT TeamName INTO team2_name FROM TEAM WHERE TeamID = NEW.Team2ID;
  
  -- Check both teams and create appropriate error message
  IF team1_player_count < 11 AND team2_player_count < 11 THEN
    SET error_msg = CONCAT('Cannot create match: Both teams do not have at least 11 players. ', 
                           team1_name, ' has ', team1_player_count, ' players and ',
                           team2_name, ' has ', team2_player_count, ' players. Each team needs at least 11 players.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_msg;
  ELSEIF team1_player_count < 11 THEN
    SET error_msg = CONCAT('Cannot create match: ', team1_name, ' does not have at least 11 players (currently has ', 
                           team1_player_count, ' players). Team needs at least 11 players.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_msg;
  ELSEIF team2_player_count < 11 THEN
    SET error_msg = CONCAT('Cannot create match: ', team2_name, ' does not have at least 11 players (currently has ', 
                           team2_player_count, ' players). Team needs at least 11 players.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_msg;
  END IF;
  
  -- Validate status based on match date and time
  SET current_datetime = NOW();
  SET match_datetime = CONCAT(NEW.MatchDate, ' ', IFNULL(NEW.MatchTime, '00:00:00'));
  
  -- If match is in the future, status cannot be 'Completed'
  IF NEW.MatchDate > CURDATE() THEN
    IF NEW.Status = 'Completed' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot mark a future match as Completed. Match date must be today or in the past.';
    END IF;
  -- If match is in the past, status can only be 'Completed' or 'Cancelled'
  ELSEIF NEW.MatchDate < CURDATE() THEN
    IF NEW.Status NOT IN ('Completed', 'Cancelled') THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot create match: Match date is in the past. Status must be Completed or Cancelled.';
    END IF;
  -- If match is today, check time
  ELSEIF NEW.MatchDate = CURDATE() THEN
    -- If time is in the future, status cannot be 'Completed'
    IF NEW.MatchTime > CURTIME() AND NEW.Status = 'Completed' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot mark a match as Completed before its scheduled time.';
    -- If time has passed, status cannot be 'Scheduled'
    ELSEIF NEW.MatchTime <= CURTIME() AND NEW.Status = 'Scheduled' THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot create match: Match time has already passed or is current. Status cannot be Scheduled.';
    END IF;
  END IF;
  
  -- Validate VenueID and RefereeID for Completed matches
  IF NEW.Status = 'Completed' THEN
    IF NEW.VenueID IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot create completed match: VenueID cannot be null for completed matches.';
    END IF;
    IF NEW.RefereeID IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot create completed match: RefereeID cannot be null for completed matches.';
    END IF;
  END IF;
END//
DELIMITER ;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default accounts
INSERT INTO USERACCOUNT (Username, Email, Password, Role) VALUES 
('admin', 'admin@sports.com', 'admin123', 'Admin'),
('user', 'user@sports.com', 'user123', 'User');

INSERT INTO ADMIN (UserID, AdminName) VALUES 
(1, 'System Admin');

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

-- League Team Stats are automatically created by the after_teamleague_insert trigger
-- Update team stats with actual values


-- Associate Teams with Tournaments
INSERT INTO TOURNAMENTTEAM (TournamentID, TeamID) VALUES
(1, 1),  -- Thunder FC in Summer Cup
(1, 2),  -- Lightning United in Summer Cup
(1, 3),  -- Storm Athletic in Summer Cup
(2, 4),  -- Phoenix FC in Winter Championship
(2, 5);  -- Dragons United in Winter Championship

-- Insert Players (55 total - 11 per team)
INSERT INTO PLAYER (PlayerName, PlayerRole) VALUES
-- Team 1: Thunder FC (Players 1-11)
('Alex Rodriguez', 'Forward'),
('James Carter', 'Midfielder'),
('Tom Wilson', 'Defender'),
('Marcus Lee', 'Goalkeeper'),
('Robert Silva', 'Defender'),
('Lucas Brown', 'Midfielder'),
('Noah Garcia', 'Forward'),
('Ethan Martinez', 'Defender'),
('Mason Lopez', 'Midfielder'),
('Logan Anderson', 'Forward'),
('Oliver Harris', 'Defender'),
-- Team 2: Lightning United (Players 12-22)
('Mike Johnson', 'Forward'),
('Chris Brown', 'Goalkeeper'),
('William Clark', 'Defender'),
('Benjamin Wright', 'Midfielder'),
('Jacob Hall', 'Forward'),
('Samuel Allen', 'Defender'),
('Daniel Young', 'Midfielder'),
('Matthew King', 'Forward'),
('Joseph Scott', 'Defender'),
('Andrew Green', 'Midfielder'),
('Ryan Adams', 'Forward'),
-- Team 3: Storm Athletic (Players 23-33)
('David Martinez', 'Midfielder'),
('Ryan Taylor', 'Defender'),
('Alexander Nelson', 'Goalkeeper'),
('Henry Carter', 'Forward'),
('Jack Mitchell', 'Defender'),
('Owen Roberts', 'Midfielder'),
('Luke Turner', 'Forward'),
('Isaac Phillips', 'Defender'),
('Nathan Campbell', 'Midfielder'),
('Gabriel Parker', 'Forward'),
('Aaron Evans', 'Defender'),
-- Team 4: Phoenix FC (Players 34-44)
('Kevin White', 'Forward'),
('Sebastian Collins', 'Goalkeeper'),
('Dylan Edwards', 'Defender'),
('Christian Stewart', 'Midfielder'),
('Julian Morris', 'Forward'),
('Caleb Rogers', 'Defender'),
('Isaiah Reed', 'Midfielder'),
('Thomas Cook', 'Forward'),
('Charles Morgan', 'Defender'),
('Zachary Bell', 'Midfielder'),
('Elijah Murphy', 'Forward'),
-- Team 5: Dragons United (Players 45-55)
('Daniel Green', 'Midfielder'),
('Joshua Bailey', 'Goalkeeper'),
('Christopher Rivera', 'Defender'),
('Hunter Cooper', 'Forward'),
('Cameron Richardson', 'Defender'),
('Connor Cox', 'Midfielder'),
('Liam Howard', 'Forward'),
('Austin Ward', 'Defender'),
('Jordan Torres', 'Midfielder'),
('Tyler Peterson', 'Forward'),
('Brandon Gray', 'Defender');

-- Associate Players with Teams (PLAYERTEAM) - 11 players per team
INSERT INTO PLAYERTEAM (PlayerID, TeamID, ContractDetails, StartDate, IsCurrent) VALUES
-- Thunder FC (Team 1)
(1, 1, 'Contract until 2026', '2022-01-01', TRUE),
(2, 1, 'Contract until 2025', '2021-06-01', TRUE),
(3, 1, 'Contract until 2027', '2023-01-01', TRUE),
(4, 1, 'Contract until 2026', '2022-03-01', TRUE),
(5, 1, 'Contract until 2025', '2021-08-01', TRUE),
(6, 1, 'Contract until 2027', '2023-02-01', TRUE),
(7, 1, 'Contract until 2026', '2022-05-01', TRUE),
(8, 1, 'Contract until 2025', '2021-07-01', TRUE),
(9, 1, 'Contract until 2027', '2023-03-01', TRUE),
(10, 1, 'Contract until 2026', '2022-04-01', TRUE),
(11, 1, 'Contract until 2025', '2021-09-01', TRUE),
-- Lightning United (Team 2)
(12, 2, 'Contract until 2026', '2022-07-01', TRUE),
(13, 2, 'Contract until 2025', '2020-01-01', TRUE),
(14, 2, 'Contract until 2027', '2023-04-01', TRUE),
(15, 2, 'Contract until 2026', '2022-08-01', TRUE),
(16, 2, 'Contract until 2025', '2021-10-01', TRUE),
(17, 2, 'Contract until 2027', '2023-05-01', TRUE),
(18, 2, 'Contract until 2026', '2022-09-01', TRUE),
(19, 2, 'Contract until 2025', '2021-11-01', TRUE),
(20, 2, 'Contract until 2027', '2023-06-01', TRUE),
(21, 2, 'Contract until 2026', '2022-10-01', TRUE),
(22, 2, 'Contract until 2025', '2021-12-01', TRUE),
-- Storm Athletic (Team 3)
(23, 3, 'Contract until 2026', '2022-03-01', TRUE),
(24, 3, 'Contract until 2024', '2019-01-01', TRUE),
(25, 3, 'Contract until 2027', '2023-07-01', TRUE),
(26, 3, 'Contract until 2026', '2022-11-01', TRUE),
(27, 3, 'Contract until 2025', '2021-01-15', TRUE),
(28, 3, 'Contract until 2027', '2023-08-01', TRUE),
(29, 3, 'Contract until 2026', '2022-12-01', TRUE),
(30, 3, 'Contract until 2025', '2021-02-01', TRUE),
(31, 3, 'Contract until 2027', '2023-09-01', TRUE),
(32, 3, 'Contract until 2026', '2022-01-15', TRUE),
(33, 3, 'Contract until 2025', '2021-03-01', TRUE),
-- Phoenix FC (Team 4)
(34, 4, 'Contract until 2027', '2023-06-01', TRUE),
(35, 4, 'Contract until 2026', '2022-02-01', TRUE),
(36, 4, 'Contract until 2025', '2021-04-01', TRUE),
(37, 4, 'Contract until 2027', '2023-10-01', TRUE),
(38, 4, 'Contract until 2026', '2022-06-01', TRUE),
(39, 4, 'Contract until 2025', '2021-05-01', TRUE),
(40, 4, 'Contract until 2027', '2023-11-01', TRUE),
(41, 4, 'Contract until 2026', '2022-07-15', TRUE),
(42, 4, 'Contract until 2025', '2021-06-15', TRUE),
(43, 4, 'Contract until 2027', '2023-12-01', TRUE),
(44, 4, 'Contract until 2026', '2022-08-15', TRUE),
-- Dragons United (Team 5)
(45, 5, 'Contract until 2025', '2021-01-01', TRUE),
(46, 5, 'Contract until 2026', '2022-09-15', TRUE),
(47, 5, 'Contract until 2027', '2023-01-15', TRUE),
(48, 5, 'Contract until 2025', '2021-07-15', TRUE),
(49, 5, 'Contract until 2026', '2022-10-15', TRUE),
(50, 5, 'Contract until 2027', '2023-02-15', TRUE),
(51, 5, 'Contract until 2025', '2021-08-15', TRUE),
(52, 5, 'Contract until 2026', '2022-11-15', TRUE),
(53, 5, 'Contract until 2027', '2023-03-15', TRUE),
(54, 5, 'Contract until 2025', '2021-09-15', TRUE),
(55, 5, 'Contract until 2026', '2022-12-15', TRUE);

-- Insert Matches (with Team1ID and Team2ID)
-- Note: Either LeagueID OR TournamentID must be provided (not both, not neither)
-- Insert matches as Scheduled first, then update to Completed to trigger LEAGUETEAMSTATS/TOURNAMENTTEAMSTATS updates
