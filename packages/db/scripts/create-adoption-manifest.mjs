import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const drizzleRoot = path.join(packageRoot, "drizzle");

const journal = JSON.parse(
  await readFile(path.join(drizzleRoot, "meta", "_journal.json"), "utf8"),
);

const entries = [];
for (const entry of journal.entries) {
  const sql = await readFile(path.join(drizzleRoot, `${entry.tag}.sql`), "utf8");
  entries.push({
    index: entry.idx,
    tag: entry.tag,
    createdAt: entry.when,
    hash: createHash("sha256").update(sql).digest("hex"),
  });
}

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(entries, null, 2)}\n`);
  process.exit(0);
}

process.stdout.write("# ZinuRooms existing-schema migration adoption manifest\n");
process.stdout.write("# Generated from committed SQL files; this command does not connect to a database.\n");
process.stdout.write("# Review against a clean-migration CI database before any existing environment is adopted.\n");
for (const entry of entries) {
  process.stdout.write(
    `${entry.index}\t${entry.createdAt}\t${entry.hash}\t${entry.tag}\n`,
  );
}
