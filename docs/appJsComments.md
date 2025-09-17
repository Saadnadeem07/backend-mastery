# 📘 App.js Comments Documentation

This document explains the purpose of each middleware configured in **app.js**.  
We moved the detailed comments here to keep `app.js` clean and readable.

---

## 🌐 Global Middleware Configuration

We use `app.use()` to register middleware that runs before our route handlers.  
This is the central place to set up things like security, parsing request bodies, handling cookies, etc.

---

## 🔄 CORS (Cross-Origin Resource Sharing)

- Allows the frontend hosted on a different origin (domain/port) to communicate with this backend.
- The `origin` option is pulled from an environment variable so we can easily change it per environment (dev, staging, prod).
- If you need advanced settings (headers, credentials, methods), you can pass additional options to this object.

```js
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Define which client origin(s) are allowed
  })
);
```

---

## 📦 JSON Body Parser

- Express can automatically parse incoming JSON payloads and populate `req.body` with a JavaScript object.
- We specify a 16 KB limit to protect the server from extremely large requests that might cause memory issues or abuse.
- This is essential when clients send data through fetch/axios with `Content-Type: application/json`.

```js
app.use(
  express.json({
    limit: "16kb",
  })
);
```

---

## 🔗 URL-Encoded Body Parser

- Handles data submitted through HTML forms or query-string style requests where the body is `application/x-www-form-urlencoded`.
- `extended: true` lets us parse nested objects instead of just flat key/value pairs.
- The same 16 KB limit applies for security and performance.
- Example: A URL like `/search?q=node%20js` or a form post will be decoded and made available on `req.body`.

```js
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
```

---

## 🖼️ Static File Serving

- Lets us serve files (images, PDFs, CSS, JS, favicon, etc.) directly from the `public` directory without writing a route.
- Any request path will automatically map to a file inside `/public` if it exists. For example:
  - `GET /logo.png` → `public/logo.png`
- Useful for hosting small assets or documentation.

```js
app.use(express.static("public"));
```

---

## 🍪 Cookie Parser

- Parses the `Cookie` header in incoming requests and populates `req.cookies` with an object of key/value pairs.
- Enables the server to read existing cookies or set new ones (e.g., for authentication tokens, session IDs, preferences).
- With this, we can easily create, update, or delete cookies as part of login flows or other stateful operations.

```js
app.use(cookieParser());
```
