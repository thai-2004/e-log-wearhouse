# Token Management System

## Overview

Hệ thống quản lý token đã được cập nhật để implement best practices cho JWT authentication với cách lưu trữ khác nhau cho từng loại token.

## Token Storage Strategy

### 🔄 Refresh Token - Database Storage

- **Lưu trữ**: MongoDB trong collection `users`
- **Fields**: `refreshToken`, `refreshTokenExpiry`
- **Thời gian sống**: 7 ngày
- **Validation**: Luôn kiểm tra với database
- **Revoke**: Xóa khỏi database khi logout/change password

### ⚡ Access Token - Memory Storage

- **Lưu trữ**: Client-side (localStorage/sessionStorage/memory)
- **Thời gian sống**: 15 phút
- **Validation**: Stateless verification (chỉ check signature)
- **Revoke**: Thêm vào blacklist khi logout

## Implementation Details

### 1. User Model Updates

```javascript
// Thêm fields mới
refreshToken: {
  type: String,
  default: null
},
refreshTokenExpiry: {
  type: Date,
  default: null
}
```

### 2. Token Blacklist Model

```javascript
// Model mới để quản lý access token đã revoke
const tokenBlacklistSchema = new mongoose.Schema({
  token: String,
  userId: ObjectId,
  expiresAt: Date,
  reason: String, // 'logout', 'password_change', 'security_revoke'
});
```

### 3. JWT Configuration

```javascript
// Async verify với blacklist check
const verifyToken = async (token, secret = JWT_SECRET) => {
  // Check blacklist first
  const blacklistedToken = await TokenBlacklist.findOne({ token });
  if (blacklistedToken) {
    throw new Error("Token has been revoked");
  }

  return jwt.verify(token, secret);
};
```

### 4. Authentication Flow

#### Login Process:

1. Verify credentials
2. Generate access token (15m) + refresh token (7d)
3. Save refresh token to database with expiry
4. Return both tokens to client

#### Token Refresh:

1. Client sends refresh token
2. Server validates against database
3. Check expiry date
4. Generate new access token
5. Return new access token

#### Logout Process:

1. Remove refresh token from database
2. Add current access token to blacklist
3. Client removes tokens from memory

#### Password Change:

1. Update password hash
2. Remove refresh token from database
3. Add current access token to blacklist
4. Force re-authentication

## Security Benefits

### ✅ Refresh Token Security:

- **Database validation**: Prevents replay attacks
- **Expiry tracking**: Automatic cleanup
- **Revocation**: Immediate invalidation
- **Single session**: One refresh token per user

### ✅ Access Token Security:

- **Blacklist mechanism**: Revoke compromised tokens
- **Short lifetime**: Minimize exposure window
- **Stateless verification**: High performance
- **Automatic cleanup**: TTL-based removal

### ✅ Overall Security:

- **Defense in depth**: Multiple security layers
- **Audit trail**: Track token usage and revocation
- **Scalable**: Efficient database queries
- **Compliant**: Follows OAuth 2.0 best practices

## Environment Variables

```env
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## API Endpoints

### Authentication:

- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens
- `PUT /api/auth/change-password` - Change password and revoke tokens

### Headers:

```
Authorization: Bearer <access_token>
```

## Error Handling

### Token Errors:

- `Token has been revoked` - Token in blacklist
- `Invalid or expired token` - Signature/invalid/expired
- `Refresh token expired` - Refresh token past expiry
- `Invalid refresh token` - Not found in database

## Performance Considerations

### Database Queries:

- **Access token verification**: 1 blacklist check per request
- **Refresh token validation**: 1 user lookup per refresh
- **Automatic cleanup**: TTL indexes for expired tokens

### Optimization:

- **Indexes**: On `token`, `userId`, `expiresAt`
- **Caching**: Consider Redis for blacklist in production
- **Batch operations**: Cleanup expired tokens in background

## Migration Notes

### Breaking Changes:

- Refresh token now requires database validation
- Access token verification is now async
- Logout now blacklists access tokens
- Password change revokes all tokens

### Client Updates Required:

- Handle new error messages
- Implement proper token refresh flow
- Store tokens securely on client-side
- Handle token revocation gracefully
