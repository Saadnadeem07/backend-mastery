import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js"; // Modular DB connection
import { app } from "./app.js";
// Initialize environment variables
dotenv.config();

// ------------------- Database Connection -------------------
/**
 * Establish connection with MongoDB before starting the server.
 * Using a modular approach keeps the codebase clean, scalable,
 * and easier to maintain compared to inline DB connection logic.
 */
//connect db was a async function so it always return a promise
connectDB()
  .then(() => {
    // Handle server-level errors gracefully
    app.on("error", (error) => {
      console.error("❌ Server failed to start:", error);
      throw error;
    });
    // ------------------- Server Setup -------------------
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });

/**
 * -------------------------------------------------------------
 *  Alternative Approach (Not Recommended in Production)
 * -------------------------------------------------------------
 * Inline DB connection code inside index.js using async/await.
 * While functional, this approach pollutes the entry file and
 * makes the codebase less modular and harder to maintain.
 *
 * Example:
 *
 * import mongoose from "mongoose";
 * import { DB_NAME } from "./constants.js";
 *
 * (async () => {
 *   try {
 *     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
 *
 *     app.listen(process.env.PORT, () => {
 *       console.log(`Server is running on PORT ${process.env.PORT}`);
 *     });
 *   } catch (error) {
 *     console.error("❌ Error connecting to DB:", error);
 *   }
 * })();
 *
 * -------------------------------------------------------------
 */
