-- OTP Verification Module: Database Migration
-- Run this against your PostgreSQL database before using the module.
--
-- Prerequisites: Your database must have a `users` table with:
--   id UUID PRIMARY KEY
--   password_hash VARCHAR NOT NULL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_user_id
ON password_reset_otps(user_id);

-- Index for cleanup queries on expired OTPs
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at
ON password_reset_otps(expires_at);

-- Add password_changed_at tracking to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
