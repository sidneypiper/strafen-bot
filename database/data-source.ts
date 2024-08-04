import "reflect-metadata"
import {DataSource} from "typeorm"
import {Infraction} from "./entity/Infraction"
import {Penalty} from "./entity/Penalty"
import {GuildSettings} from "./entity/GuildSettings";

if (!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set");
}

const database_url = process.env.DATABASE;

const database: DataSource = new DataSource({
    type: "sqlite",
    database: database_url,
    synchronize: true,
    logging: false,
    entities: [Penalty, Infraction, GuildSettings],
    migrations: [],
    subscribers: [],
});

export default async function getDatabase(): Promise<DataSource> {
    if (database.isInitialized) return database;

    try {
        await database.initialize()
        console.log("Database has been initialized!");
    } catch (err) {
        console.error("Error during Database initialization", err)
    }

    return database;
}