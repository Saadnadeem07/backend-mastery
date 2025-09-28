# Why We Need `auth.middleware.js` to Verify JWT

## Overview

When building a secure web application, user authentication is critical. After a user logs in, the server issues a **JSON Web Token (JWT)** as proof of authentication.
To protect routes and resources, we need to verify that this token is valid on every request. This is where the `auth.middleware.js` comes in.

## Reasons for Verification

### 1. Ensure Token Integrity

JWTs are signed using a secret or a private key. Verification checks the token’s signature to confirm it hasn’t been tampered with.
Without this, anyone could modify the token payload and gain unauthorized access.

### 2. Authenticate the Request

By verifying the token, the middleware ensures that the request is coming from a user who actually logged in and received the token from our server,
not from an attacker forging credentials.

### 3. Check Token Expiration

JWTs include an expiration (`exp`) claim. The middleware rejects tokens that are expired or not yet valid,
ensuring only timely and valid sessions are accepted.

### 4. Validate Audience and Issuer

Claims like `aud` (audience) and `iss` (issuer) ensure the token was intended for our application.
Verification protects against tokens issued for other apps or environments.

### 5. Centralized Security

By implementing an `auth.middleware.js`, we can attach the decoded token data (like `userId` or `roles`) to `req.user`.
This makes it easy for all protected routes to access verified user information consistently and securely.

## Typical Flow

1. **User Logs In:** Server generates and sends a JWT to the client.
2. **Client Makes Request:** Client includes the JWT in an `Authorization` header or HTTP-only cookie.
3. **auth.middleware.js Runs:** Middleware verifies the token’s signature, expiration, and claims.
4. **Route Handler Executes:** If verification passes, the request proceeds; otherwise, it’s blocked with a 401 Unauthorized response.

## Logout Considerations

JWTs are stateless, so logging out typically means:

- Removing the token from client storage or clearing the cookie.
- Optionally maintaining a server-side blacklist for immediate token revocation.

## Conclusion

The `auth.middleware.js` is essential for **secure, scalable, and maintainable** authentication.
It ensures every protected route automatically verifies JWTs and rejects any unauthorized access attempts.
