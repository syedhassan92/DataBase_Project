# Database Setup

## For New Installation

To set up the database on a new computer, follow these steps:

1.  **Install MySQL**: Ensure MySQL is installed and running.
2.  **Create Database**: You can use a tool like phpMyAdmin or MySQL Workbench, or the command line.
3.  **Import Schema and Data**:
    *   Run the `complete-setup.sql` file. This file contains the entire database schema (tables, triggers) and the initial seed data (default users, teams, matches, etc.).
    *   It will create the database `sports_management_db` if it doesn't exist.

## For Existing Database (Migration)

If you already have a database running and need to update it with schema changes:

1.  **Open phpMyAdmin**
2.  **Select your database** (`sports_management_db`)
3.  **Go to the SQL tab**
4.  **Copy and paste** the contents of `migration-add-email-to-useraccount.sql`
5.  **Click Go** to execute the migration

**⚠️ Important**: Always backup your database before running migrations!

## Default Credentials

*   **Admin**:
    *   Email: `admin@sports.com`
    *   Password: `admin123`
*   **User**:
    *   Email: `user@sports.com`
    *   Password: `user123`

**Note**: Authentication now uses Email instead of Username.
