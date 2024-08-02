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

    discord.once(Events.ClientReady, async readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);

        await readyClient.user.setUsername('Strafenbot');
        readyClient.user.setActivity('Google Chrome', { type: ActivityType.Playing });

        const rest = new REST().setToken(token);

        console.log('Starting refreshing application (/) commands.')
        await rest.put(Routes.applicationCommands(clientId), {
            body: commands.map(c => c.payload())
        })
        console.log('Successfully refreshed application (/) commands.')

        const commandsU = await rest.get(Routes.applicationCommands(clientId));
        console.log(commandsU)
    });

    await discord.login(token);

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
