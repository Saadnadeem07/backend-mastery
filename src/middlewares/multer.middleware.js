// Multer configuration for handling multipart/form-data uploads
// ------------------------------------------------------------
// Multer is an Express middleware that parses incoming multipart/form-data
// requests (commonly used for file uploads). This setup stores files
// temporarily on the server’s local filesystem before they’re processed
// further (e.g., uploaded to Cloudinary).

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Get current file's directory (because ES Modules don’t have __dirname)
const x = fileURLToPath(import.meta.url);
const y = path.dirname(x);

console.log(y);
// Configure disk storage for uploaded files.
// ------------------------------------------
// destination: Directory path where the file will be stored temporarily.
// filename:    Function to generate a unique name to avoid overwriting files.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in a temporary public directory.
    // Ensure this folder exists (e.g., create /public/temp in your project root).
    cb(null, path.join(y, "../../public/temp"));
    //cb(null, "../../public/temp");
  },

  // Generate a unique filename for each uploaded file.
  // Prevents accidental overwriting of files with the same original name.

  filename: function (req, file, cb) {
    // Combine the original file name with a time-based unique suffix.
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });

// Create the Multer middleware instance using the configured storage engine.
// --------------------------------------------------------------------------
// Use this `upload` instance in your route handlers:
//   app.post('/upload', upload.single('fieldName'), (req, res) => { ... });
