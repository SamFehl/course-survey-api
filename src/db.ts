import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Decide when to use SSL
// - Render / cloud DBs: usually require SSL
// - Localhost DB: usually does NOT use SSL
const isLocalhost =
  connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const useSSL = !isLocalhost; // use SSL for non-local connections (e.g., Render)

export const pool = new Pool(
  useSSL
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false }, // good for Render / most managed Postgres
      }
    : {
        connectionString, // no SSL for local Postgres
      }
);
