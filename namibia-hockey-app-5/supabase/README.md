# Supabase Authentication Setup

This document provides instructions for setting up Supabase authentication for the Hockey Union app.

## Prerequisites

- Access to the Supabase project: https://hzsquqkkdaelcjkaaxaz.supabase.co
- Supabase credentials (already set in the `.env` file)

## Database Setup

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql` into the SQL Editor
4. Run the SQL script to create the necessary tables and functions

## Authentication Configuration

The app is already configured to use Supabase authentication with the following features:

- Email/password sign-up and sign-in
- User profiles stored in the `profiles` table
- Automatic profile creation when a new user signs up
- Row-level security policies to protect user data

## Database Schema

### Profiles Table

| Column      | Type                     | Description                          |
|-------------|--------------------------|--------------------------------------|
| id          | UUID (Primary Key)       | References auth.users.id             |
| full_name   | TEXT                     | User's full name                     |
| email       | TEXT                     | User's email address                 |
| avatar_url  | TEXT                     | URL to user's avatar image           |
| role        | TEXT                     | User's role (e.g., Player, Coach)    |
| team        | TEXT                     | User's team name                     |
| created_at  | TIMESTAMP WITH TIME ZONE | When the profile was created         |
| updated_at  | TIMESTAMP WITH TIME ZONE | When the profile was last updated    |

## Security

The database is configured with Row Level Security (RLS) to ensure:

- Public profiles are viewable by everyone
- Users can only insert their own profile
- Users can only update their own profile

## Automatic Triggers

- `update_profiles_updated_at`: Updates the `updated_at` timestamp whenever a profile is modified
- `on_auth_user_created`: Creates a profile entry whenever a new user signs up

## Testing Authentication

You can test the authentication by:

1. Creating a new account using the Sign Up screen
2. Logging in with the created account
3. Viewing and updating your profile information

## Troubleshooting

If you encounter issues with authentication:

1. Check the browser console for error messages
2. Verify that the Supabase URL and anonymous key are correct in the `.env` file
3. Check the Supabase dashboard for any authentication errors
