import {Database} from "bun:sqlite"
import type {Penalty} from "./entity/Penalty"
import type {Infraction} from "./entity/Infraction"
import type {GuildSettings} from "./entity/GuildSettings"

if (!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set")
}

const db = new Database(process.env.DATABASE, {create: true})
db.exec("PRAGMA journal_mode = WAL")
db.exec("PRAGMA foreign_keys = ON")

db.exec(`
    CREATE TABLE IF NOT EXISTS penalty (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        guild_id TEXT NOT NULL,
        cashed_out_on TEXT,
        created_on TEXT NOT NULL DEFAULT (datetime('now'))
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS infraction (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        penalty_id TEXT NOT NULL,
        created_on TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (penalty_id) REFERENCES penalty(id)
    )
`)

db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
        id TEXT PRIMARY KEY,
        currency TEXT NOT NULL DEFAULT '$',
        announcement_channel TEXT,
        created_on TEXT NOT NULL DEFAULT (datetime('now'))
    )
`)

// Migration: add announcement_channel if missing
try {
    db.exec("ALTER TABLE guild_settings ADD COLUMN announcement_channel TEXT")
} catch (_) {
    // Column already exists
}

console.log("Database has been initialized!")

// Penalty queries
const findPenaltiesByGuild = db.prepare<Penalty, {$guild_id: string}>(
    "SELECT * FROM penalty WHERE guild_id = $guild_id"
)

const findPenaltyNamesByGuild = db.prepare<Pick<Penalty, "name">, {$guild_id: string}>(
    "SELECT name FROM penalty WHERE guild_id = $guild_id"
)

const findPenaltyByGuildAndName = db.prepare<Penalty, {$guild_id: string; $name: string}>(
    "SELECT * FROM penalty WHERE guild_id = $guild_id AND name = $name COLLATE NOCASE"
)

const insertPenalty = db.prepare(
    "INSERT INTO penalty (name, description, price, guild_id) VALUES ($name, $description, $price, $guild_id)"
)

const deletePenalty = db.prepare("DELETE FROM penalty WHERE id = $id")

const selectPenaltyList = db.prepare<{name: string; description: string; price: number}, {$guild_id: string}>(
    "SELECT name, description, price FROM penalty WHERE guild_id = $guild_id"
)

// Infraction queries
const insertInfraction = db.prepare(
    "INSERT INTO infraction (user_id, guild_id, penalty_id) VALUES ($user_id, $guild_id, $penalty_id)"
)

const findLatestInfractionByGuildAndUser = db.prepare<
    Infraction & {penalty_name: string; penalty_price: number},
    {$guild_id: string; $user_id: string}
>(
    `SELECT i.*, p.name as penalty_name, p.price as penalty_price
     FROM infraction i
     JOIN penalty p ON i.penalty_id = p.id
     WHERE i.guild_id = $guild_id AND i.user_id = $user_id
     ORDER BY i.created_on DESC
     LIMIT 1`
)

const deleteInfraction = db.prepare("DELETE FROM infraction WHERE id = $id")

const generalCashStats = db.prepare<
    {user_id: string; count_penalty: number; sum_penalty_price: number},
    {$guild_id: string}
>(
    `SELECT i.user_id, COUNT(*) as count_penalty, SUM(p.price) as sum_penalty_price
     FROM infraction i
     JOIN penalty p ON i.penalty_id = p.id
     WHERE i.guild_id = $guild_id
     GROUP BY i.user_id
     ORDER BY sum_penalty_price DESC`
)

const userCashStats = db.prepare<
    {penalty_name: string; count_penalty: number; sum_penalty_price: number},
    {$guild_id: string; $user_id: string}
>(
    `SELECT p.name as penalty_name, COUNT(*) as count_penalty, SUM(p.price) as sum_penalty_price
     FROM infraction i
     JOIN penalty p ON i.penalty_id = p.id
     WHERE i.guild_id = $guild_id AND i.user_id = $user_id
     GROUP BY p.name
     ORDER BY sum_penalty_price DESC`
)

// GuildSettings queries
const findGuildSettings = db.prepare<GuildSettings, {$id: string}>(
    "SELECT * FROM guild_settings WHERE id = $id"
)

const upsertGuildSettings = db.prepare(
    "INSERT INTO guild_settings (id, currency) VALUES ($id, $currency) ON CONFLICT(id) DO UPDATE SET currency = $currency"
)

const updateGuildSetting = db.prepare(
    "UPDATE guild_settings SET currency = $value WHERE id = $id"
)

const setAnnouncementChannel = db.prepare(
    "UPDATE guild_settings SET announcement_channel = $channel_id WHERE id = $id"
)

const allGuildSettings = db.prepare<GuildSettings, Record<string, never>>(
    "SELECT * FROM guild_settings WHERE announcement_channel IS NOT NULL"
)

export default {
    penalty: {
        findByGuild: (guild_id: string) => findPenaltiesByGuild.all({$guild_id: guild_id}),
        findNamesByGuild: (guild_id: string) => findPenaltyNamesByGuild.all({$guild_id: guild_id}),
        findByGuildAndName: (guild_id: string, name: string) => findPenaltyByGuildAndName.get({$guild_id: guild_id, $name: name}),
        insert: (name: string, description: string, price: number, guild_id: string) =>
            insertPenalty.run({$name: name, $description: description, $price: price, $guild_id: guild_id}),
        delete: (id: string) => deletePenalty.run({$id: id}),
        list: (guild_id: string) => selectPenaltyList.all({$guild_id: guild_id}),
    },
    infraction: {
        insert: (user_id: string, guild_id: string, penalty_id: string) =>
            insertInfraction.run({$user_id: user_id, $guild_id: guild_id, $penalty_id: penalty_id}),
        findLatest: (guild_id: string, user_id: string) =>
            findLatestInfractionByGuildAndUser.get({$guild_id: guild_id, $user_id: user_id}),
        delete: (id: string) => deleteInfraction.run({$id: id}),
        generalStats: (guild_id: string) => generalCashStats.all({$guild_id: guild_id}),
        userStats: (guild_id: string, user_id: string) => userCashStats.all({$guild_id: guild_id, $user_id: user_id}),
    },
    guildSettings: {
        find: (id: string) => findGuildSettings.get({$id: id}),
        upsert: (id: string, currency: string) => upsertGuildSettings.run({$id: id, $currency: currency}),
        updateSetting: (id: string, setting: string, value: string) => {
            // Only currency is supported currently
            if (setting === 'currency') {
                updateGuildSetting.run({$id: id, $value: value})
            }
        },
        setAnnouncementChannel: (id: string, channelId: string | null) =>
            setAnnouncementChannel.run({$id: id, $channel_id: channelId}),
        allWithAnnouncementChannel: () => allGuildSettings.all({}),
    },
}
