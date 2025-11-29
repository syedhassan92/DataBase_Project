-- Sports Management Database Schema (BCNF Compliant)

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
);

-- ADMIN Table (BCNF: UserID determines all attributes)
CREATE TABLE ADMIN (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    AdminName VARCHAR(100) NOT NULL,
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
    FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID) ON DELETE CASCADE,
    CHECK (EndDate >= StartDate)
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
-- Ensures no duplicate team names within the same league
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
-- Removed surrogate key to achieve BCNF
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
-- Removed TeamID to achieve BCNF (a player's team can change)
CREATE TABLE PLAYER (
    PlayerID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerName VARCHAR(100) NOT NULL,
    PlayerRole VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PLAYERTEAM Table (New: Associates players with teams and contract details)
-- BCNF: Allows tracking player transfers and current team
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
-- Added Team1ID and Team2ID to properly reference teams
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

-- MATCHSTATS Table (BCNF: MatchStatsID determines all attributes)
-- Tracks team performance statistics for each match
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
    -- Only proceed if the match was just completed and has league data
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' AND NEW.LeagueID IS NOT NULL THEN
        -- Update stats for Team1
        UPDATE TEAMSTATS
        SET 
            MatchesPlayed = MatchesPlayed + 1,
            GoalsFor = GoalsFor + NEW.Team1Score,
            GoalDifference = GoalDifference + (NEW.Team1Score - NEW.Team2Score),
            Wins = Wins + CASE 
                WHEN NEW.Team1Score > NEW.Team2Score THEN 1 
                ELSE 0 
            END,
            Draws = Draws + CASE 
                WHEN NEW.Team1Score = NEW.Team2Score THEN 1 
                ELSE 0 
            END,
            Losses = Losses + CASE 
                WHEN NEW.Team1Score < NEW.Team2Score THEN 1 
                ELSE 0 
            END,
            Points = Points + CASE 
                WHEN NEW.Team1Score > NEW.Team2Score THEN 3 
                WHEN NEW.Team1Score = NEW.Team2Score THEN 1 
                ELSE 0 
            END
        WHERE LeagueID = NEW.LeagueID AND TeamID = NEW.Team1ID;
        
        -- Update stats for Team2
        UPDATE TEAMSTATS
        SET 
            MatchesPlayed = MatchesPlayed + 1,
            GoalsFor = GoalsFor + NEW.Team2Score,
            GoalDifference = GoalDifference + (NEW.Team2Score - NEW.Team1Score),
            Wins = Wins + CASE 
                WHEN NEW.Team2Score > NEW.Team1Score THEN 1 
                ELSE 0 
            END,
            Draws = Draws + CASE 
                WHEN NEW.Team2Score = NEW.Team1Score THEN 1 
                ELSE 0 
            END,
            Losses = Losses + CASE 
                WHEN NEW.Team2Score < NEW.Team1Score THEN 1 
                ELSE 0 
            END,
            Points = Points + CASE 
                WHEN NEW.Team2Score > NEW.Team1Score THEN 3 
                WHEN NEW.Team2Score = NEW.Team1Score THEN 1 
                ELSE 0 
            END
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

-- Trigger to enforce single admin constraint
DELIMITER //
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

-- Insert default admin user
INSERT INTO USERACCOUNT (Username, Email, Password, Role) VALUES ('admin', 'admin@sports.com', 'admin123', 'Admin');
INSERT INTO ADMIN (UserID, AdminName) VALUES (1, 'System Admin');

-- Insert default regular user
INSERT INTO USERACCOUNT (Username, Email, Password, Role) VALUES ('user', 'user@sports.com', 'user123', 'User');
