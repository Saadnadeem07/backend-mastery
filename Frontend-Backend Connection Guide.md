# Frontend ↔ Backend Connection Guide

## 1. The Big Picture

When we build web apps, we usually have:

- **Frontend**: React (Vite, CRA, Next.js, etc.) → runs in the browser.
- **Backend**: Express, Django, FastAPI, etc. → runs on a server, provides APIs.
- **API Communication**: Frontend makes HTTP requests → Backend sends data (JSON).

**Flow in development with Vite proxy:**

```
React (http://localhost:5173)
   ↓ axios/fetch → /api/jokes
Vite Dev Server (Proxy)
   ↓ forwards request
Express Backend (http://localhost:3000/api/jokes)
   ↓ responds with JSON
React receives & renders
```

---

## 2. How Frontend Makes Requests

We have two common ways to call APIs:

### 🔹 Using Fetch (native)

```jsx
useEffect(() => {
  fetch("/api/jokes")
    .then((res) => res.json())
    .then((data) => setJokes(data));
}, []);
```

### 🔹 Using Axios (library)

```jsx
useEffect(() => {
  axios.get("/api/jokes").then((response) => {
    setJokes(response.data);
  });
}, []);
```

✅ Both work the same with proxy, since proxy operates at the **network level**.

---

## 3. The Role of Proxy

In **vite.config.js**:

```jsx
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

### 🔹 What happens:

- Frontend calls → `/api/jokes`
- Vite proxy intercepts `/api` requests
- Forwards them to → `http://localhost:3000/api/jokes`

👉 This prevents **CORS errors** during development.

---

## 4. Path Handling in Proxy

By default, `/api` is preserved:

- `/api/jokes` (frontend) → `http://localhost:3000/api/jokes` (backend must match)

If you want backend routes without `/api`:

```jsx
proxy: {
  "/api": {
    target: "http://localhost:3000",
    rewrite: (path) => path.replace(/^\/api/, ""),
  },
}
```

Now:

- `/api/jokes` (frontend) → `http://localhost:3000/jokes` (backend route = `/jokes`)

---

## 5. Backend Example (Express)

```jsx
import express from "express";
const app = express();

app.get("/api/jokes", (req, res) => {
  res.json([
    { id: 1, name: "Nadeem" },
    { id: 2, name: "Saad" },
    { id: 3, name: "Fahad" },
  ]);
});

app.listen(3000, () => console.log("Backend running on port 3000"));
```

---

## 6. Industry Best Practices

### 🔹 Development Phase

- Use **proxy** (Vite, CRA, Webpack) to avoid CORS hassle.
- Keep API prefix `/api` → avoids clashes with frontend routes.

### 🔹 Production Phase ❌

- **No proxy** (proxy is dev-only).
- Frontend is built (`npm run build`) → static files served via:
  - Same backend (Express can `app.use(express.static("dist"))`) ❌
  - Or via Nginx/Apache serving React → proxying `/api` to backend. ✅

Example production setup:

```
https://myapp.com          → serves React (static)
https://myapp.com/api/...  → forwards to backend API
```

### 🔹 General Guidelines

1. Always include `/api` prefix in backend routes → avoids confusion with frontend paths.
2. Use **unique IDs** in backend data (`id`, not `index`) for React keys.
3. Prefer **Axios** in larger projects (more features: interceptors, automatic JSON parsing, error handling).
4. Use **environment variables** for API URLs in production:

   ```jsx
   const API_BASE = import.meta.env.VITE_API_URL || "/api";
   axios.get(`${API_BASE}/jokes`);
   ```

5. In teams, keep consistent naming conventions:
   - Frontend → always request `/api/...`
   - Backend → always expose `/api/...`

---

## 7. Data Flow Summary

1. **Frontend** makes a request (`axios` or `fetch`) → `/api/...`
2. **Vite Proxy (dev only)** forwards `/api/...` → backend server.
3. **Backend** processes request & sends JSON.
4. **Frontend** receives JSON, updates state, re-renders UI.

---

## 8. Diagram

```
           ┌───────────────────┐
           │   React Frontend  │
           │ (http://localhost:5173) │
           └─────────┬─────────┘
                     │ axios/fetch
                     ▼
           ┌───────────────────┐
           │  Vite Proxy (/api)│
           └─────────┬─────────┘
                     │ forwards
                     ▼
           ┌───────────────────┐
           │ Express Backend   │
           │ (http://localhost:3000) │
           └───────────────────┘
```

---

⚡ That’s the **full lifecycle**: frontend ↔ proxy ↔ backend, with axios/fetch and best practices.
