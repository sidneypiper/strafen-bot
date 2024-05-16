import { ActivityType, Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import type Command from "./Command";

export async function initDiscordClient(commands: Command[]) {
    if (!process.env.DC_TOKEN)
        throw new Error('DC_TOKEN environment variable is not set');

    if (!process.env.DC_GUILD_ID)
        throw new Error('DC_GUILD_ID environment variable is not set');

    if (!process.env.DC_CLIENT_ID)
        throw new Error('DC_CLIENT_ID environment variable is not set');

    const token = process.env.DC_TOKEN;
    const guildId = process.env.DC_GUILD_ID;
    const clientId = process.env.DC_CLIENT_ID;

    const discord = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
        ]
    });

    discord.once(Events.ClientReady, readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);

        readyClient.user.setUsername('Strafenbot');
        readyClient.user.setActivity('you fail!', { type: ActivityType.Watching });
    });

    discord.login(token);

    const rest = new REST().setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);

    rest.put(Routes.applicationCommands(clientId), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);

    try {
        console.log('Starting refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId!, guildId!),
            { body: commands.map(c => c.payload()) },
        );

        console.log('Successfully refreshed application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    discord.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        for (const command of commands) {
            if (command.name === commandName)
                command.handle(interaction);
        }
    });
}

export const logoUrl = 'https://i.imgur.com/4Ril0n5.png';
