# 🌐 HTTP – Complete Beginner Guide

## Key idea:

HTTP (HyperText Transfer Protocol) defines how data moves between a client and a server on the web.  
**HTTPS = HTTP + encryption (TLS/SSL)** for security.  
Concepts remain the same; HTTPS just protects the communication.

---

## 🔑 Important Terminology

| Term                                  | Meaning                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| **URL (Uniform Resource Locator)**    | Full web address to a resource. Example: `https://example.com/users/1`       |
| **URI (Uniform Resource Identifier)** | A more general identifier of a resource. A URL is a type of URI.             |
| **URN (Uniform Resource Name)**       | Names a resource without giving its location. Example: `urn:isbn:0451450523` |

---

## 🧩 HTTP Headers

Headers = metadata (key-value pairs) sent with every request/response.  
They describe how to process the body, authentication info, caching rules, etc.

- **Custom headers**: You can define your own (`X-Custom-Header: value`).

### Two directions:

- **Request headers** → sent by the client (browser, Postman, Thunder Client…).
- **Response headers** → sent back by the server.

### What headers enable

- **Caching** (e.g., `Cache-Control: max-age=3600`)
- **Authentication & Sessions** (e.g., `Authorization: Bearer <token>`)
- **State management** (Cookies)

### Common Headers

| Header            | Purpose                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Accept**        | Tells server what data types the client accepts (`application/json`, `text/html`…) |
| **User-Agent**    | Identifies client app (Chrome, Postman, etc.)                                      |
| **Authorization** | Passes tokens or credentials                                                       |
| **Content-Type**  | Type of the request/response body (`application/json`, `image/png`…)               |
| **Cookie**        | Sends stored cookies to server                                                     |
| **Cache-Control** | Caching instructions (`max-age`, `no-cache`)                                       |

---

## 🌍 CORS (Cross-Origin Resource Sharing) Headers

Used when a browser requests a resource from a different origin.

| Header                               | Role                                            |
| ------------------------------------ | ----------------------------------------------- |
| **Access-Control-Allow-Origin**      | Which origins (domains) are allowed             |
| **Access-Control-Allow-Methods**     | Which HTTP methods are allowed (`GET`, `POST`…) |
| **Access-Control-Allow-Credentials** | Whether cookies/credentials can be sent         |

---

## 🔒 Security Headers

Add extra protection to your site:

- **Content-Security-Policy** – Restricts where resources (scripts, images) can load from.
- **Cross-Origin-Opener-Policy** & **Cross-Origin-Embedder-Policy** – Control cross-origin interactions.
- **X-XSS-Protection** – Helps block cross-site scripting attacks.

---

## ⚡ HTTP Methods

Each method = intended action on a resource.

| Method      | Typical Use                           |
| ----------- | ------------------------------------- |
| **GET**     | Retrieve data                         |
| **POST**    | Create new data                       |
| **PUT**     | Replace existing data                 |
| **PATCH**   | Partially update data                 |
| **DELETE**  | Remove data                           |
| **HEAD**    | Same as GET but returns only headers  |
| **OPTIONS** | Discover allowed methods & CORS info  |
| **TRACE**   | Diagnostic echo of the request (rare) |

---

## ✅ Status Codes

Tell the client what happened.

| Range   | Meaning       | Examples                                         |
| ------- | ------------- | ------------------------------------------------ |
| **1xx** | Informational | 100 Continue, 102 Processing                     |
| **2xx** | Success       | 200 OK, 201 Created, 202 Accepted                |
| **3xx** | Redirection   | 307 Temporary Redirect, 308 Permanent Redirect   |
| **4xx** | Client Error  | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| **5xx** | Server Error  | 500 Internal Server Error, 504 Gateway Timeout   |

---

## 🏁 How a Request Flows

Client (browser/Postman) sends a request with:

- **URL + method**
- **Headers** (metadata)
- **Optional body** (e.g., JSON)

Server receives it, processes logic, and responds with:

- **Status code**
- **Response headers**
- **Optional body** (HTML, JSON, file…)

---

### 💡 Tip:

Think of HTTP as a language both sides agree on:

- **Headers = grammar**
- **Methods = actions**
- **Status codes = replies**
