/**
 * Seeds (or updates) the single admin account from ADMIN_EMAIL / ADMIN_PASSWORD
 * in the environment. The password is stored as a bcrypt hash — never in plain text.
 *
 * Usage (from artifacts/app): node scripts/seed-admin.mjs
 */
import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in the environment.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(
  `INSERT INTO "AdminUser" (id, email, "passwordHash")
   VALUES ($1, $2, $3)
   ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash"`,
  [randomUUID(), email, passwordHash],
);
await client.end();

console.log(`Admin account ready: ${email}`);
