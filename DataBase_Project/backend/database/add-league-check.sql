-- Add CHECK constraint to LEAGUE table to ensure EndDate >= StartDate
ALTER TABLE LEAGUE
ADD CONSTRAINT check_league_dates CHECK (EndDate >= StartDate);
