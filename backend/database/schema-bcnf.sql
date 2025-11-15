-- Sports Management Database Schema (BCNF Compliant)

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
    Contact VARCHAR(50) UNIQUE,
    Experience INT DEFAULT 0,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REFEREE Table (BCNF: RefereeID determines all attributes)
CREATE TABLE REFEREE (
    RefereeID INT AUTO_INCREMENT PRIMARY KEY,
    RefereeName VARCHAR(100) NOT NULL,
    Contact VARCHAR(50),
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
-- Allows a team to participate in multiple leagues with different coaches
CREATE TABLE TEAMLEAGUE (
    TeamLeagueID INT AUTO_INCREMENT PRIMARY KEY,
    TeamID INT NOT NULL,
    LeagueID INT NOT NULL,
    CoachID INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE,
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    FOREIGN KEY (CoachID) REFERENCES COACH(CoachID) ON DELETE SET NULL,
    UNIQUE KEY unique_team_league (TeamID, LeagueID)
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
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (LeagueID, TeamID),
    FOREIGN KEY (LeagueID) REFERENCES LEAGUE(LeagueID) ON DELETE CASCADE,
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE
);

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
    FOREIGN KEY (TeamID) REFERENCES TEAM(TeamID) ON DELETE CASCADE
);

-- PLAYERSTATS Table (BCNF: StatsID determines all attributes)
CREATE TABLE PLAYERSTATS (
    StatsID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerID INT NOT NULL,
    MatchesPlayed INT DEFAULT 0,
    Wins INT DEFAULT 0,
    GoalsOrRuns INT DEFAULT 0,
    Assists INT DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0.00,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PlayerID) REFERENCES PLAYER(PlayerID) ON DELETE CASCADE
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
    CHECK (Team1ID != Team2ID)
);

-- MATCHSTATS Table (BCNF: MatchStatsID determines all attributes)
-- Tracks team performance statistics for each match
CREATE TABLE MATCHSTATS (
    MatchStatsID INT AUTO_INCREMENT PRIMARY KEY,
    MatchID INT NOT NULL,
    TeamID INT NOT NULL,
    Score INT DEFAULT 0,
    Possession INT DEFAULT 0,
    Fouls INT DEFAULT 0,
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

-- Insert default admin user
INSERT INTO USERACCOUNT (Username, Password, Role) VALUES ('admin', 'admin123', 'Admin');
INSERT INTO ADMIN (UserID, AdminName, Email) VALUES (1, 'System Admin', 'admin@sports.com');

-- Insert default regular user
INSERT INTO USERACCOUNT (Username, Password, Role) VALUES ('user', 'user123', 'User');
