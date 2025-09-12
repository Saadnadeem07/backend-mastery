# Custom Errors & Standard API Responses

**Files:** `ApiError.js`, `ApiResponse.js`

## 1. Purpose

Modern APIs must return **predictable, uniform JSON** whether a request
succeeds or fails.\
Two helper classes make that easy:

- **`ApiError`** -- a unified object for all server-side errors.\
- **`ApiResponse`** -- a standard container for successful responses.

Clients always receive a consistent shape:

```json
// Error
{ "statusCode": 404, "success": false, "message": "User not found", "errors": [] }

// Success
{ "statusCode": 200, "success": true, "message": "User fetched", "data": { ... } }
```

---

## 2. Custom Class Design

### `ApiError`

Extends Node's native `Error` to carry extra context: - **statusCode**
-- HTTP code (400, 404, 500, etc.).\

- **message** -- Human-readable explanation.\
- **errors** -- Optional array of validation or field-specific issues.\
- **data** -- Optional payload if you want to send extra info.\
- **success** -- Always `false`.\
- **stack** -- Captured stack trace for debugging
  (`Error.captureStackTrace`).

This ensures _all_ thrown errors---whether from routes, services, or
middleware---look identical.

### `ApiResponse`

Lightweight wrapper for success cases: - **statusCode** -- Typically 200
or 201.\

- **message** -- Defaults to `"Success"`.\
- **data** -- The actual payload.\
- **success** -- Computed automatically as `statusCode < 400`, aligning
  with HTTP semantics.

These classes live in separate files (`ApiError.js` / `ApiResponse.js`)
to keep controllers clean and focused.

---

## 3. Express Request & Response Essentials

- **Request (`req`)**: Data from the client.
  - `req.params` -- Dynamic URL segments (`/users/:id` →
    `req.params.id`).
  - `req.body` -- JSON or form data in the body.
  - `req.cookies` -- Cookies sent with the request.
  - `req.get('Header')` -- Access a specific HTTP header.
- **Response (`res`)**: Methods to send data back.
  - `res.status(code)` -- Set HTTP status.
  - `res.json(object)` -- Send JSON.

---

## 4. Cookies & Pre-Configuration

Before reading or setting cookies: - Use middleware like
`cookie-parser`. - Apply security flags (`httpOnly`, `secure`,
`sameSite`) when setting cookies. - Read values later with
`req.cookies`.

---

## 5. Middleware: The Verification Layer

Middleware runs **between** the incoming request and the final route
logic.

Common uses: - Authentication & authorization (check if user is logged
in or is an admin). - Input validation / sanitation. - Logging, rate
limiting, or analytics.

Signature:

```js
(req, res, next)(
  // regular middleware
  err,
  req,
  res,
  next
); // error-handling middleware
```

Flow:

    Client → [Auth Middleware] → [Validation] → [Route Handler] → Response

Order matters---middleware executes top-down.

---

## 6. Database & Async Patterns

- **connectDB**: An `async` function to open and reuse a database
  connection. All DB operations are asynchronous, so `await` is
  required.

- **asyncHandler**: Higher-order helper to wrap any async route:

  ```js
  const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  ```

  This avoids repetitive `try/catch` blocks and sends any error to
  global error middleware.

---

## 7. Why It Matters

- **Consistency** -- Every response follows one predictable format.\
- **Clarity for Clients** -- Front-end teams or third-party
  integrators know exactly how to parse results.\
- **Maintainability** -- Centralized error/response logic reduces
  boilerplate and prevents mismatched JSON across routes.\
- **Professional API Design** -- A hallmark of production-ready
  Express applications.

---

**Summary:**\
`ApiError` and `ApiResponse`, combined with proper middleware and async
helpers, give your backend a **clean, enterprise-grade error and
response strategy** that scales and remains easy to maintain.
