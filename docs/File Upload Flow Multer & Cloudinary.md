# 📂 File Upload Flow: Multer → Cloudinary

## 1️⃣ Purpose & High-Level Flow

Allow users to upload **any type of file** (images, videos, PDFs, etc.) through an Express backend.

### End-to-End Flow
1. **Client Upload** – User selects a file and submits it to an API endpoint.  
2. **Multer Middleware** – Intercepts the `multipart/form-data` request and saves the file temporarily to `/public/temp` with a **unique name**.  
3. **Cloudinary Service** – Our custom `uploadOnCloudinary()` reads the temp file, uploads it to Cloudinary’s managed storage, and returns the file’s public URL + metadata.  
4. **Cleanup & Response** – Temp file removed whether upload succeeds or fails. API responds with the Cloudinary URL to save in DB or return to client.

---

## 🔄 Complete File-Upload Lifecycle

1. **Client Request**  
   User hits (e.g.) `POST /upload` with a multipart/form-data request containing the file field named **"file"**.

2. **Multer Middleware Runs First**
   ```js
   router.post("/upload", upload.single("file"), controller);
   ```
   - `upload.single("file")` intercepts the request **before** the controller.
   - Multer parses multipart data, stores the file in `/public/temp/`, and assigns a unique filename.

3. **`req.file` Populated**  
   Express moves to the controller; `req.file.path` points to the stored temp file.

4. **Cloudinary Upload**
   ```js
   const result = await uploadOnCloudinary(req.file.path);
   ```
   - Reads file from temp folder.
   - Uses `cloudinary.uploader.upload` to push it to Cloudinary.
   - Returns a secure public URL + metadata.

5. **Cleanup & Response**  
   Optionally delete local temp file (helper already deletes on error).  
   API sends back the Cloudinary URL or stores it in the database.

---

## 🏁 One-Line Summary

**Request ➜ Multer saves temp file ➜ Controller calls Cloudinary ➜ Cloudinary stores permanently ➜ Response returns public URL**

---

## 2️⃣ Key Files

### `multer.middleware.js`

- **Imports:** `multer`
- **Purpose:** Express middleware to handle file uploads before route logic.
- **Config:**
  ```js
  const storage = multer.diskStorage({
    destination: "/public/temp",
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.originalname}-${unique}`);
    },
  });
  export const upload = multer({ storage });
  ```
- **Usage Example:**
  ```js
  router.post('/upload', upload.single('file'), controllerFunction);
  ```
  `req.file.path` holds the local file path for the next step.

### `cloudinary.js`

- **Imports:** `v2 as cloudinary` from `cloudinary`, and `fs` for cleaning temp files.
- **Configuration:**
  ```js
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  ```
- **Uploader Function:**
  ```js
  const uploadOnCloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) return null;
      const res = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto", // Detects image, video, etc.
      });
      console.log("Uploaded:", res.url);
      return res;
    } catch (err) {
      fs.unlinkSync(localFilePath); // Cleanup on failure
      return null;
    }
  };
  export { uploadOnCloudinary };
  ```
- **Role:** Takes the Multer-generated file path and uploads it to Cloudinary with full async/await error handling.

---

## 3️⃣ Putting It All Together

**Typical Route**
```js
import { upload } from "./middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "./services/cloudinary.js";

router.post("/media", upload.single("mediaFile"), async (req, res) => {
  const result = await uploadOnCloudinary(req.file.path);
  if (!result) return res.status(500).json({ error: "Upload failed" });
  res.json({ url: result.secure_url });
});
```

**Step-by-Step**
1. Request hits route → Multer runs first.  
2. Multer saves temp file → adds `req.file.path`.  
3. Controller calls Cloudinary → passes `req.file.path`.  
4. Cloudinary uploads → returns hosted URL.  
5. API responds → client receives permanent URL; local file cleaned.

---

## 4️⃣ Why This Approach

- **Security & Scalability:** Files never live permanently on your server—Cloudinary serves them via global CDN.  
- **Flexibility:** `resource_type: "auto"` supports images, videos, and documents seamlessly.  
- **Error Handling:** `try/catch` ensures failed uploads don’t leave orphaned temp files.

---

## ✅ Deployment Checklist

- Create a Cloudinary account; obtain:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Add them as environment variables.
- Ensure `/public/temp` exists and is writable.
- Secure upload routes with authentication/authorization.

---

## 📍 Understanding `upload.single('file')`

- `upload.single('file')` is Multer’s API to accept **one file** from the form field named `"file"`.
- **Where It Comes From**
  ```js
  import multer from "multer";
  const storage = multer.diskStorage({...});
  export const upload = multer({ storage });
  ```
- **Helpers:**  
  - `upload.single(fieldName)`  
  - `upload.array(fieldName, maxCount)`  
  - `upload.fields([{ name, maxCount }, ...])`

- **Meaning of `single('file')`:** Accept exactly one file from a field named `file`.
  ```html
  <input type="file" name="file" />
  ```
- **Express Output:** `req.file` contains metadata like `originalname`, `path`, `size`, etc.
