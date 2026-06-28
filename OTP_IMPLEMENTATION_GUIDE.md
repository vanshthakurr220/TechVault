# Email OTP Validation Implementation Guide

## Overview

This document outlines the email OTP (One-Time Password) validation system implemented in TechVault to prevent fake email registrations during signup and email changes during profile editing.

## Features Implemented

### 1. **Signup Flow with Email OTP**
- Users must verify their email address before creating an account
- Three-step process: Email verification → OTP verification → Account details
- OTP expires after 10 minutes
- Maximum 5 verification attempts per OTP

### 2. **Profile Email Change with OTP**
- Users can change their email address from the profile page
- Email change requires OTP verification
- Direct email updates without verification are blocked
- Seamless modal-based verification flow

### 3. **Backend OTP Management**
- Automatic OTP generation (6-digit random number)
- Email delivery via Nodemailer
- Database storage with TTL (Time-To-Live) of 10 minutes
- Attempt tracking and rate limiting

## Architecture

### Database Models

#### OTP Model (`server/models/OTP.ts`)
```typescript
{
  email: String,              // Email to verify
  otp: String,                // 6-digit OTP
  purpose: "signup" | "email_change",
  verified: Boolean,          // Verification status
  attempts: Number,           // Failed attempt count
  createdAt: Date,           // Auto-deletes after 10 minutes
  expiresAt: Date            // Manual expiration time
}
```

#### User Model (Updated)
- Email field remains unique
- No changes to existing fields
- Email updates now only through OTP verification endpoint

### API Endpoints

#### Signup OTP Endpoints

**1. Send OTP for Signup**
```
POST /api/auth/send-otp-signup
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent successfully to your email",
  "email": "user@example.com"
}
```

**2. Verify OTP for Signup**
```
POST /api/auth/verify-otp-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "message": "OTP verified successfully",
  "email": "user@example.com",
  "verified": true
}
```

**3. Complete Signup** (Modified)
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "securepassword",
  "mobile": "+91 98765 43210"
}

Requirements:
- Email must be verified via OTP first
- Will fail if OTP verification is missing

Response:
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "username": "johndoe",
    "email": "user@example.com",
    "mobile": "+91 98765 43210",
    "role": "user"
  }
}
```

#### Email Change OTP Endpoints (Protected)

**1. Send OTP for Email Change**
```
POST /api/auth/send-otp-email-change
Authorization: Bearer {token}
Content-Type: application/json

{
  "newEmail": "newemail@example.com"
}

Response:
{
  "message": "OTP sent successfully to your new email",
  "newEmail": "newemail@example.com"
}
```

**2. Verify OTP and Update Email**
```
POST /api/auth/verify-otp-email-change
Authorization: Bearer {token}
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "otp": "123456"
}

Response:
{
  "message": "Email updated successfully",
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "newemail@example.com",
    "mobile": "+91 98765 43210",
    "role": "user"
  }
}
```

#### Profile Update Endpoint (Modified)
```
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newusername",
  "mobile": "+91 98765 43211"
}

Note: Email parameter is now ignored
Email changes must use the OTP verification endpoint
```

## Frontend Components

### 1. SignupWithOTP Component (`client/src/pages/SignupWithOTP.tsx`)

**Features:**
- Step-by-step signup process
- Email validation and OTP sending
- OTP verification with attempt tracking
- Account details form after email verification
- Resend OTP functionality
- Visual progress indicators

**States:**
- `email`: Email being verified
- `otp`: OTP entered by user
- `step`: Current step (email, otp, details)
- `formData`: Account details (username, password, mobile)
- `loading`: Loading state for async operations
- `otpAttempts`: Track failed OTP attempts

### 2. ProfileWithOTP Component (`client/src/pages/ProfileWithOTP.tsx`)

**Features:**
- All existing profile functionality
- Email change modal with OTP verification
- Separate email change flow
- Protected email update
- Seamless user experience

**New States:**
- `showEmailChangeModal`: Modal visibility
- `emailChangeStep`: Step in email change (new-email, otp)
- `newEmail`: New email being set
- `emailOtp`: OTP for email verification
- `emailChangeLoading`: Loading state

## Email Service

### Configuration (`server/utils/emailService.ts`)

**Supported Methods:**
1. **Gmail SMTP** (Production)
   - Requires: `EMAIL_USER` and `EMAIL_PASSWORD` environment variables
   - Use Gmail App Password for security

2. **Ethereal Email** (Development/Testing)
   - Automatically used if credentials not provided
   - No real emails sent, preview links provided

**Email Templates:**
- Signup verification email
- Email change verification email
- Professional HTML formatting
- 10-minute expiration notice

### Environment Variables

```bash
# For production email sending
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Optional: Custom email sender
EMAIL_FROM=noreply@techvault.com
```

## Security Features

### 1. **OTP Security**
- 6-digit random OTP (1 million combinations)
- 10-minute expiration time
- Automatic database cleanup after expiration
- Attempt limiting (max 5 failed attempts)

### 2. **Email Verification**
- Prevents duplicate email registrations
- Blocks direct email updates without verification
- Unique email constraint in database
- Prevents email takeover scenarios

### 3. **Rate Limiting**
- One OTP per email at a time
- Old OTP automatically replaced when new one requested
- Failed attempts tracked and limited

### 4. **Data Protection**
- OTP stored in database (not in session)
- JWT tokens for authenticated requests
- Bearer token required for email change
- Proper error messages without info leakage

## Testing the Implementation

### Manual Testing Steps

#### 1. Test Signup with OTP

```bash
# Step 1: Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp-signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Step 2: Verify OTP (use OTP from email)
curl -X POST http://localhost:5000/api/auth/verify-otp-signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# Step 3: Complete signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "mobile": "+91 98765 43210"
  }'
```

#### 2. Test Email Change with OTP

```bash
# Step 1: Send OTP for email change (requires token)
curl -X POST http://localhost:5000/api/auth/send-otp-email-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{"newEmail": "newemail@example.com"}'

# Step 2: Verify and update email
curl -X POST http://localhost:5000/api/auth/verify-otp-email-change \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {jwt_token}" \
  -d '{"newEmail": "newemail@example.com", "otp": "123456"}'
```

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Email is already registered" | Email exists in database | Use different email |
| "OTP not found or already verified" | OTP doesn't exist or expired | Request new OTP |
| "OTP has expired" | 10 minutes passed | Request new OTP |
| "Maximum attempts exceeded" | 5 failed attempts | Request new OTP |
| "Invalid OTP" | Wrong OTP entered | Check email and retry |
| "Email not verified" | Signup without OTP verification | Verify email first |
| "Email is already in use" | New email already registered | Use different email |

## Migration Notes

### For Existing Users

If you have existing users in the database:

1. **No action required** - Existing users can still login normally
2. **Email change** - Existing users must use OTP verification for email changes
3. **Backward compatibility** - All existing functionality preserved

### Database Migration

No migration required. OTP model is created automatically on first use.

## Configuration Options

### Customize OTP Expiration

Edit `server/controllers/otpController.ts`:
```typescript
// Change from 10 minutes to desired time
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

### Customize OTP Length

Edit `server/utils/emailService.ts`:
```typescript
export const generateOTP = (): string => {
  // Change 100000-900000 range for different lengths
  return Math.floor(100000 + Math.random() * 900000).toString();
};
```

### Customize Attempt Limit

Edit `server/controllers/otpController.ts`:
```typescript
if (otpRecord.attempts >= 5) { // Change 5 to desired limit
  // ...
}
```

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_PASSWORD
   ```

2. **For Gmail:**
   - Enable "Less secure app access"
   - Or use App-specific password
   - Check if 2FA is enabled

3. **Check logs:**
   - Look for error messages in server console
   - Verify email service configuration

### OTP Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. Check server logs for email sending errors
4. Request new OTP

### Verification Fails

1. Ensure OTP hasn't expired (10 minutes)
2. Check for typos in OTP
3. Verify email matches the one OTP was sent to
4. Check attempt count (max 5)

## Future Enhancements

1. **SMS OTP** - Add SMS-based OTP as alternative
2. **OTP Resend Limit** - Limit resend attempts
3. **Email Verification Status** - Track verification in user model
4. **OTP History** - Maintain audit log of OTP requests
5. **Custom OTP Length** - Allow configurable OTP length
6. **Two-Factor Authentication** - Extend to 2FA system

## Support

For issues or questions:
1. Check error messages in browser console
2. Review server logs
3. Verify environment configuration
4. Test with provided curl commands
5. Check database for OTP records

## Files Modified/Created

### New Files
- `server/models/OTP.ts` - OTP data model
- `server/controllers/otpController.ts` - OTP logic
- `server/utils/emailService.ts` - Email sending service
- `client/src/pages/SignupWithOTP.tsx` - Signup with OTP
- `client/src/pages/ProfileWithOTP.tsx` - Profile with email change OTP

### Modified Files
- `server/routes/authRoutes.ts` - Added OTP endpoints
- `server/controllers/authController.ts` - Updated signup to require OTP
- `client/src/App.tsx` - Updated routes to use OTP components
- `package.json` - Added nodemailer dependency

## License

This implementation is part of TechVault and follows the same license as the main project.
