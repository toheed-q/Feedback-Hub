/**
 * Enables Postgres trigram search used for duplicate detection.
 *
 * - pg_trgm: the trigram similarity extension (typo-tolerant fuzzy matching).
 * - A GIN trigram index on Ticket.title so similarity lookups stay fast at scale.
 *
 * Safe to run repeatedly. Usage (from artifacts/app): node scripts/setup-search.mjs
 */
import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
await client.query(
  `CREATE INDEX IF NOT EXISTS ticket_title_trgm_idx
     ON "Ticket" USING gin (title gin_trgm_ops)`,
);

await client.end();
console.log("pg_trgm extension and trigram index are ready.");
