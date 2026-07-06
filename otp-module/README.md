# OTP Verification Module

A self-contained, reusable OTP (One-Time Password) verification module for **Express.js + PostgreSQL** projects. Provides a complete password-reset flow: generate → email → verify → reset.

## Features

- 6-digit numeric OTP generation
- OTPs are **bcrypt-hashed** before storage (never stored in plaintext)
- Configurable expiration (default: 15 minutes)
- Brute-force protection with attempt limiting (default: 5 attempts)
- Previous OTPs are auto-invalidated on new request
- HTML email template via Nodemailer
- Frontend: 6-digit split-input with auto-focus, paste support, and auto-verify

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | ≥ 18    |
| PostgreSQL  | ≥ 13    |
| Express.js  | ≥ 4     |

### Required npm packages

```bash
npm install bcrypt nodemailer pg dotenv
```

### Required database

Your project must have a `users` table with at minimum:
```sql
-- Your existing users table must have these columns:
id UUID PRIMARY KEY,
email VARCHAR UNIQUE NOT NULL,
password_hash VARCHAR NOT NULL
```

---

## Setup Steps

### 1. Run the migration

```bash
psql -U your_user -d your_db -f otp-module/backend/migrations/create_password_reset_otps.sql
```

### 2. Set environment variables

Add these to your `.env`:
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=Your App <your-email@gmail.com>
```

### 3. Backend integration

```javascript
// In your server.js or app.js:
const otpRoutes = require('./path-to/otp-module/backend/routes/otpRoutes');

app.use('/api/auth', otpRoutes);
// This adds:
//   POST /api/auth/forgot-password
//   POST /api/auth/verify-otp
//   POST /api/auth/reset-password
```

### 4. Connect to YOUR database

In `otp-module/backend/model/otpModel.js`, update the pool import to point to your database connection:

```javascript
// Change this line:
const pool = require("../../database/db");
// To your project's db module:
const pool = require("../path-to-your/db");
```

### 5. Connect to YOUR user model

In `otp-module/backend/controller/otpController.js`, update the `findUserByEmail` import:

```javascript
// Change this line:
const { findUserByEmail } = require("../../model/UserModel");
// To your project's user model:
const { findUserByEmail } = require("../path-to-your/UserModel");
```

### 6. Frontend integration

Copy the frontend files and update the API base URL in `otpApi.js`:

```javascript
const API_BASE_URL = "http://localhost:5000/api"; // your API URL
```

---

## Customization Points

| Setting | Location | Default |
|---------|----------|---------|
| OTP length | `otpController.js` line 9 | 6 digits |
| Expiration time | `otpController.js` line 14 | 15 minutes |
| Max attempts | DB migration `max_attempts` column | 5 |
| Email template | `otpEmailService.js` | Career Verse branded |
| SMTP provider | `.env` variables | Gmail |

---

## API Endpoints

### POST `/api/auth/forgot-password`
```json
{ "email": "user@example.com" }
// → 200: { "message": "OTP sent to email successfully" }
```

### POST `/api/auth/verify-otp`
```json
{ "email": "user@example.com", "otp": "123456" }
// → 200: { "message": "OTP verified successfully" }
```

### POST `/api/auth/reset-password`
```json
{ "email": "user@example.com", "otp": "123456", "password": "newpass123" }
// → 200: { "message": "Password reset successful" }
```
