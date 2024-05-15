import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Guild } from "./entity/Guild"
import { Penalty } from "./entity/Penalty"

if(!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set")
}

const database_url = process.env.DATABASE

const database = new DataSource({
    type: "sqlite",
    database: database_url,
    synchronize: true,
    logging: false,
    entities: [User, Guild, Penalty],
    migrations: [],
    subscribers: [],
})

database.initialize()
    .then(() => {
        console.log("Database has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Database initialization", err)
    });

export default database;
