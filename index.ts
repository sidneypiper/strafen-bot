import {COMMANDS, initDiscordClient} from './core/Helpers';
import {ActivityType, Events} from "discord.js";
import {GuildSettings} from "./database/entity/GuildSettings";
import {Equal} from "typeorm";
import getDatabase from "./database/data-source";

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

    client.on(Events.GuildCreate, async guild => {
        const guildSettingsRepo = (await getDatabase()).getRepository(GuildSettings);

        try {
            await guildSettingsRepo.findOneByOrFail({id: Equal(guild.id)})
        } catch (_e) {
            await guildSettingsRepo.insert({
                id: guild.id,
                currency: '$'
            })
        }
    })

    client.rest.on('rateLimited', rateLimitInfo => {
        console.log('Rate limited', rateLimitInfo);
    })
})