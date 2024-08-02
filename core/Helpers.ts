import {Client, GatewayIntentBits, REST} from "discord.js";
import type Command from "./Command";
import Cash from "../commands/Cash";
import List from "../commands/List";
import Create from "../commands/Create";
import Remove from "../commands/Remove";
import Add from "../commands/Add";
import Undo from "../commands/Undo";
import Help from "../commands/Help";
import ForceAdd from "../commands/ForceAdd";

export const LOGO_URL = 'https://i.imgur.com/77nbiOw.jpeg';
export const COMMANDS: Command[] = [Cash, List, Create, Remove, Add, Undo, Help, ForceAdd];

export async function initDiscordClient(): Promise<Client> {
    if (!process.env.DC_TOKEN)
        throw new Error('DC_TOKEN environment variable is not set');

    if (!process.env.DC_CLIENT_ID)
        throw new Error('DC_CLIENT_ID environment variable is not set');

    const token = process.env.DC_TOKEN;

    const discord = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ]
    });

    discord.rest = new REST().setToken(token);

    await discord.login(token);

    return discord;
}

