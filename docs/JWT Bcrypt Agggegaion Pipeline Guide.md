# Project README — Video Platform Backend (Professional Guide)

> Concise, practical, and project-ready documentation for developers who are new to this codebase.
> Read this start-to-finish and you’ll understand the architecture, security decisions, and how to work with:
>
> - `User` and `Video` Mongoose models
> - JWT-based authentication (access + refresh tokens)
> - Password hashing with bcrypt
> - Aggregation + pagination using `mongoose-aggregate-paginate-v2`
> - Best practices, common pitfalls, and deployment guidance

---

## Table of contents

1. Overview
2. Quick start
3. Environment variables
4. Install & run
5. Project structure (high-level)
6. Models: User & Video (what they store and why)
7. Authentication flow (access + refresh tokens)
8. Token storage strategies: cookies vs headers
9. Password hashing (bcrypt) — why & how
10. Mongoose hooks & middleware patterns
11. Aggregation pagination (`mongoose-aggregate-paginate-v2`) — usage example
12. Error handling: `ApiError` and `ApiResponse` patterns
13. Common pitfalls & gotchas (things you should fix)
14. Security checklist
15. Testing & debugging tips
16. Deployment notes
17. Contributing & contact

---

## 1. Overview

This backend provides a secure, maintainable foundation for a video-sharing platform.  
Key aims:

- Consistent API responses and error handling.
- Secure authentication (short-lived access token + long-lived refresh token).
- Efficient data access for lists and feeds using MongoDB aggregation pipelines and pagination.

---

## 2. Quick start (summary)

```bash
# 1. clone
git clone <repo-url>
cd <repo>

# 2. install
npm install

# 3. create .env (see below)

# 4. start in dev
npm run dev
```

---

## 3. Environment variables

Create a `.env` file in project root. Minimum recommended variables:

```
ACCESS_TOKEN_SECRET=your-strong-random-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-other-strong-secret
REFRESH_TOKEN_EXPIRY=10d
MONGODB_URI=mongodb://username:password@host:port/dbname
NODE_ENV=development
PORT=4000
```

**Notes**

- Keep secrets out of source control. Use a secrets manager in production.
- `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` must be different and long.
- Typical expiry: short for access (minutes/hours/days), longer for refresh (days/weeks).

---

## 4. Install & run

Recommended packages used throughout the project:

```
npm install express mongoose jsonwebtoken bcrypt cookie-parser dotenv cors helmet morgan mongoose-aggregate-paginate-v2
# Dev tools
npm install -D nodemon
```

Start commands (example `package.json` scripts):

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

---

## 5. Project structure (high-level)

```
src/
  models/
    user.model.js        # User schema, auth helpers (JWT, bcrypt)
    video.model.js       # Video schema, aggregation plugin
  controllers/
    auth.controller.js
    video.controller.js
  middlewares/
    asyncHandler.js      # wrapper for async routes
    authMiddleware.js    # verifies access tokens
    errorHandler.js      # global ApiError -> JSON response
  utils/
    connectDB.js
  app.js
  server.js
.env
README.md
```

---

## 6. Models: User & Video (what they store and why)

### User model (high-level)

- `username, email, fullname`: searchable identity fields (indexes for performance).
- `avatar, coverImage`: media URLs stored in cloud (Cloudinary, S3).
- `watchHistory`: array of ObjectIds referencing `Video` — use to build personalized feeds.
- `password`: hashed using bcrypt (never store plaintext).
- `refreshToken`: latest refresh token (optional strategy) — can be used for session invalidation.

**Why store refreshToken?**
Storing the last refresh token per user lets you revoke sessions by clearing the stored token. Alternative is stateless refresh tokens with a server-side revocation list.

### Video model (high-level)

- `videoFile, thumbnail`: media references.
- `owner`: reference to `User` (important for authorization).
- `title, description, duration, views, isPublished`: metadata for feeds and search.

**Plugin used:** `mongoose-aggregate-paginate-v2` enables paginated aggregation queries (recommended for feeds and complex filtering).

---

## 7. Authentication flow (detailed)

1. **Login**
   - Client sends credentials to `/auth/login`.
   - Server checks `isPasswordCorrect()` (bcrypt.compare).
   - If valid, server issues:
     - **Access Token** (JWT) signed with `ACCESS_TOKEN_SECRET`, short expiry.
     - **Refresh Token** (JWT) signed with `REFRESH_TOKEN_SECRET`, longer expiry.

2. **Access protected routes**
   - Client sends Access Token with request (cookie or `Authorization: Bearer <token>`).
   - Server verifies token; if valid, request proceeds.

3. **When access token expires**
   - Client requests `/auth/refresh` (usually automatically).
   - Client sends Refresh Token (secure cookie or header).
   - Server verifies Refresh Token and issues a new Access Token.
   - Optionally rotate refresh token (issue new refresh token and persist it), increasing security.

4. **Logout / invalidation**
   - Clear tokens on client and, if using stored refresh tokens, remove it from DB.

---

## 8. Token storage strategies: cookies vs headers

### Cookies (recommended for web apps)

- Pros:
  - Browser sends cookies automatically.
  - Mark as `HttpOnly`, `Secure`, `SameSite` to mitigate XSS/CSRF.
- Cons:
  - Need CSRF mitigation if not using `SameSite=Strict` or SameSite+CSRF tokens.

**Set cookies example:**

```js
res.cookie("accessToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
});
```

### Authorization header (recommended for mobile & APIs)

- Pros:
  - Explicit, easy to debug.
  - No CSRF issue.
- Cons:
  - Client-side storage (localStorage) can be vulnerable to XSS; prefer secure storage for mobile.

---

## 9. Password hashing (bcrypt) — why & how

- Bcrypt is a slow hashing algorithm that protects against brute-force.
- Use at least 10 salt rounds (common default).
- Hash on save using a Mongoose `pre('save')` hook **only when the password changed**.

**Important**: Use `await bcrypt.hash(password, saltRounds)` inside the hook so the string is stored, not a Promise.

---

## 10. Mongoose hooks & middleware patterns

- **Pre-save**: hash password.
- **Instance methods**: verify password, generate tokens.
- **Model plugins**: `videoSchema.plugin(mongooseAggregatePaginate)` adds `aggregatePaginate`.
- **Async wrapper**:
  ```js
  const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  ```

---

## 11. Aggregation pagination (`mongoose-aggregate-paginate-v2`) — example

**Why**: Aggregation pipelines are efficient for feeds (search, lookup, sort, group). Pagination across an aggregation is non-trivial; this plugin helps.

**Usage:**

```js
const pipeline = [
  { $match: { isPublished: true } },
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
    },
  },
  { $unwind: "$owner" },
  { $project: { title: 1, thumbnail: 1, "owner.username": 1, views: 1 } },
];

const options = { page: 1, limit: 10, sort: { createdAt: -1 } };

const result = await Video.aggregatePaginate(
  Video.aggregate(pipeline),
  options
);

/* result example:
{
  docs: [...],
  totalDocs: 120,
  limit: 10,
  page: 1,
  totalPages: 12,
  hasNextPage: true
}
*/
```

---

## 12. Error handling: `ApiError` & `ApiResponse`

- `ApiError` extends `Error` and adds: `statusCode`, `success=false`, `errors[]`, `stack`.
- `ApiResponse` standardizes success replies: `statusCode`, `success`, `message`, `data`.

**Global error middleware pattern:**

```js
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }
  // Unknown errors -> 500
  return res
    .status(500)
    .json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    });
}
```

---

## 13. Common pitfalls & gotchas (things to fix / watch)

- **bcrypt.hash missing `await`**: ensure you `await bcrypt.hash(...)` in the pre-save hook.
- **jwt `sign` option name**: use `expiresIn` (not `expiry`) in `jwt.sign()` options:
  ```js
  jwt.sign(payload, secret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
  ```
- **`statck` typo**: parameter named `statck` in ApiError is a typo. Prefer `stack`.
- **Storing refresh tokens**: if you store the refresh token on user doc, clear it on logout.
- **Indexing**: add indexes only for fields frequently searched (username, email, fullname).
- **Cookie flags**: always set `HttpOnly`, use `Secure` in production, and consider `SameSite`.

---

## 14. Security checklist

- [ ] Strong, unique JWT secrets and rotation policy.
- [ ] Use HTTPS/SSL in production.
- [ ] Store tokens securely (HttpOnly cookies recommended for web).
- [ ] Rate-limit authentication endpoints.
- [ ] Validate inputs & sanitize user-provided data.
- [ ] Use helmet/cors settings for headers and origins.
- [ ] Monitor and log auth failures.

---

## 15. Testing & debugging tips

- Use Postman or HTTP client to inspect cookie behavior (enable "send cookies").
- Add logging around auth flows (do not print secrets).
- Test with malformed tokens, expired tokens, missing cookies to confirm middleware behavior.

---

## 16. Deployment notes

- Use environment secrets (Cloud provider secret manager) instead of plain `.env` file in production.
- Use process managers (pm2) or container orchestrators.
- Scale read-heavy endpoints with indexes and consider caching common queries (Redis).

---

## 17. Contributing & contact

- Fork the repo → create a feature branch → open a PR with clear description.
- Keep commits atomic and write clear PR descriptions.
- For help, open an issue with steps to reproduce.

---

## Final words

This README is intended to turn a newcomer into a confident contributor: it explains why decisions were made, how core auth pieces work, and which pitfalls to avoid. Keep it updated as you change auth, token lifetimes, or storage strategies.

Happy coding 🚀
