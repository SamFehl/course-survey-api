"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}
// Decide when to use SSL
// - Render / cloud DBs: usually require SSL
// - Localhost DB: usually does NOT use SSL
const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const useSSL = !isLocalhost; // use SSL for non-local connections (e.g., Render)
exports.pool = new pg_1.Pool(useSSL
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false }, // good for Render / most managed Postgres
    }
    : {
        connectionString, // no SSL for local Postgres
    });
