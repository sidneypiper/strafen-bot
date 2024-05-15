import knex, { Knex } from 'knex';

class Database {
    private static instance: Knex | null = null;

    private constructor() {}

    public static getInstance(): Knex {
        if (!Database.instance) {
            if (!process.env.DATABASE) {
                throw new Error('DATABASE environment variable is not set');
            }

            Database.instance = knex({
              client: 'better-sqlite3',
              connection: {
                filename: process.env.DATABASE,
              },
              useNullAsDefault: true,
            });
        }
        return Database.instance;
    }
}

export default Database;
