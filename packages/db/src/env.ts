
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root (../../.env from packages/db/src/env.ts is actually ../../../.env relative to this file)
// src/ -> db/ -> packages/ -> root/
const rootEnvPath = path.resolve(__dirname, "../../../.env");

console.log(`Loading .env from ${rootEnvPath}`);
dotenv.config({ path: rootEnvPath });
