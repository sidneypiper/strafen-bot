import "reflect-metadata"
import { DataSource } from "typeorm"
import { Infraction } from "./entity/Infraction"
import { Penalty } from "./entity/Penalty"

if (!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set");
}

const database_url = process.env.DATABASE;

const database = new DataSource({
    type: "sqlite",
    database: database_url,
    synchronize: true,
    logging: false,
    entities: [Penalty, Infraction],
    migrations: [],
    subscribers: [],
});

database.initialize()
    .then(async () => {
        console.log("Database has been initialized!");
        const afk = await database.manager.insert(Penalty, {
            name: 'AFK',
            guild_id: '1239207144528805950',
            description: 'Ohne Ankündigung ungemuted AFK sein.',
            price: 1
        });

        const gelaber = await database.manager.insert(Penalty, {
            name: 'Dünnschissgelaber',
            guild_id: '1239207144528805950',
            description: 'Brutales Dünnschissgelaber',
            price: .5
        });

        database.manager.insert(Infraction, {
            user_id: '818148062064017450',
            guild_id: '1239207144528805950',
            penalty: afk.identifiers[0]
        });

        database.manager.insert(Infraction, {
            user_id: '818148062064017450',
            guild_id: '1239207144528805950',
            penalty: afk.identifiers[0]
        });

        database.manager.insert(Infraction, {
            user_id: '818148062064017450',
            guild_id: '1239207144528805950',
            penalty: gelaber.identifiers[0]
        });
    })
    .catch((err) => {
        console.error("Error during Database initialization", err)
    });

export default database;
