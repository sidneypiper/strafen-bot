import { knex } from 'knex';
import { Client, GatewayIntentBits, Events } from 'discord.js';

if (!process.env.DATABASE) {
  throw new Error('DATABASE environment variable is not set');
}

if (!process.env.TOKEN) {
    throw new Error('TOKEN environment variable is not set');
}

const database = knex({
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DATABASE,
  },
});

const discord = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

discord.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

discord.login(process.env.token);

