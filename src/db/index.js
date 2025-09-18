import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

/**
 * Establishes a connection to the MongoDB database.
 *
 * - Uses environment variable `MONGODB_URI` as the base URI.
 * - Appends the `DB_NAME` constant for the specific database.
 * - Logs the connected host on successful connection.
 * - Gracefully handles errors and prevents the app from running
 *   without a database connection.
 */

//connect db is a async function so it always return a promise
const connectDB = async () => {
  try {
    const mongoURI = `${process.env.MONGODB_URI}/${DB_NAME}`;

    //console.log(`🔗 Attempting MongoDB connection at: ${mongoURI}`);
    //if u did console-log any user can see it -- BLUNDER

    const connectionInstance = await mongoose.connect(mongoURI);

    console.log(
      `✅ MongoDB Connected! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};
export default connectDB;
