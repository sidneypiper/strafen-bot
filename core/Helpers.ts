import {ActivityType, Client, Events, GatewayIntentBits, Guild, REST, Routes} from "discord.js";
import type Command from "./Command";

export async function initDiscordClient(commands: Command[]) {
    if (!process.env.DC_TOKEN)
        throw new Error('DC_TOKEN environment variable is not set');

    if (!process.env.DC_CLIENT_ID)
        throw new Error('DC_CLIENT_ID environment variable is not set');

    const token = process.env.DC_TOKEN;
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
        readyClient.user.setActivity('Google Chrome', { type: ActivityType.Playing });
    });

    await discord.login(token);

    const rest = new REST().setToken(token);

    await discord.guilds.fetch()

    discord.guilds.cache.each((guild: Guild) => {
        rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: [] })
            .then(() => console.log('Successfully deleted all guild commands for ' + guild.name))
            .catch(console.error);
    })

    rest.put(Routes.applicationCommands(clientId), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);

    try {
        console.log('Starting refreshing application (/) commands.');

        discord.guilds.cache.each((guild: Guild) => {
            rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commands.map(c => c.payload()) })
                .then(() => console.log('Successfully added all guild commands for ' + guild.name))
                .catch(console.error);
        })

        console.log('Successfully refreshed application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    discord.on(Events.InteractionCreate, async interaction => {
        if (!(interaction.isCommand() || interaction.isAutocomplete())) return;

        const { commandName } = interaction;

        for (const command of commands) {
            if (command.name === commandName)
                await command.handle(interaction);
        }
    });
}

export const logoUrl = 'https://i.imgur.com/77nbiOw.jpeg';
