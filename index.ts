import {COMMANDS, initDiscordClient} from './core/Helpers';
import {ActivityType, Events} from "discord.js";

initDiscordClient().then(client => {
    client.once(Events.ClientReady, async readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);

        await readyClient.user.setUsername('Strafenbot');
        readyClient.user.setActivity('Google Chrome', {type: ActivityType.Playing});
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!(interaction.isCommand() || interaction.isAutocomplete())) return;

        const {commandName} = interaction;

        for (const command of COMMANDS)
            if (command.name === commandName)
                await command.handle(interaction);
    });

    client.rest.on('rateLimited', rateLimitInfo => {
        console.log('Rate limited', rateLimitInfo);
    })
})