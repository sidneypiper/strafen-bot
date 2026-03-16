import {Database} from "bun:sqlite"

const dbPath = process.argv[2]
if (!dbPath) {
    console.error("Usage: bun run scripts/migrate-db.ts <path-to-database.db>")
    process.exit(1)
}

const db = new Database(dbPath)

// Check if migration is needed
const columns = db.prepare("PRAGMA table_info(infraction)").all() as {name: string}[]
const hasPenaltyId = columns.some(c => c.name === "penalty_id")
const hasOldPenaltyId = columns.some(c => c.name === "penaltyId")

if (hasPenaltyId && !hasOldPenaltyId) {
    console.log("Database is already in the new format. Nothing to do.")
    process.exit(0)
}

if (!hasOldPenaltyId) {
    console.error("Unexpected schema: no 'penaltyId' or 'penalty_id' column found.")
    process.exit(1)
}

console.log("Migrating infraction table: renaming 'penaltyId' -> 'penalty_id'...")

db.exec("ALTER TABLE infraction RENAME COLUMN penaltyId TO penalty_id")

// Add announcement_channel to guild_settings if missing
const gsColumns = db.prepare("PRAGMA table_info(guild_settings)").all() as {name: string}[]
if (!gsColumns.some(c => c.name === "announcement_channel")) {
    console.log("Adding 'announcement_channel' column to guild_settings...")
    db.exec("ALTER TABLE guild_settings ADD COLUMN announcement_channel TEXT")
}

console.log("Migration complete.")
