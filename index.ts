import './core/Logger';
import {COMMANDS, initDiscordClient} from './core/Helpers';
import {ActivityType, Events, MessageFlags, TextChannel} from "discord.js";
import db from "./database/data-source";

const SARCASTIC_GREETINGS = [
    "Against all odds, I'm actually online right now.",
    "Don't get too excited, I'll probably crash in a minute.",
    "I'm alive. I know, I'm just as surprised as you are.",
    "Working as intended. For once.",
    "Plot twist: the bot is online. No, this is not a test.",
    "Yes, I'm actually running. No, I don't know how long this will last.",
    "Enjoy it while it lasts.",
    "I booted up successfully. Mark your calendars, this is a historic moment.",
    "Somehow I'm online again. Don't jinx it.",
    "Status: operational. Estimated time until next crash: who knows.",
]

initDiscordClient().then(client => {
    client.once(Events.ClientReady, async readyClient => {
        console.log(`Ready! Logged in as ${readyClient.user.tag}`);

        readyClient.user.setActivity('your mistakes', {type: ActivityType.Watching});

        const guildsWithChannel = db.guildSettings.allWithAnnouncementChannel();
        for (const settings of guildsWithChannel) {
            try {
                const channel = await readyClient.channels.fetch(settings.announcement_channel!);
                if (channel instanceof TextChannel) {
                    const greeting = SARCASTIC_GREETINGS[Math.floor(Math.random() * SARCASTIC_GREETINGS.length)];
                    await channel.send(greeting);
                }
            } catch (e) {
                console.error(`Failed to send greeting to channel ${settings.announcement_channel} in guild ${settings.id}:`, e);
            }
        }
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!(interaction.isChatInputCommand() || interaction.isAutocomplete())) return;
        if (!interaction.guild) {
            if (interaction.isChatInputCommand()) {
                await interaction.reply({content: 'I only work in servers, not in DMs.', flags: MessageFlags.Ephemeral});
            }
            return;
        }

        const {commandName} = interaction;

        for (const command of COMMANDS)
            if (command.name === commandName)
                await command.handle(interaction);
    });

    client.on(Events.GuildCreate, async guild => {
        const existing = db.guildSettings.find(guild.id)
        if (!existing) {
            db.guildSettings.upsert(guild.id, '$')
        }
    })

    client.rest.on('rateLimited', rateLimitInfo => {
        console.log('Rate limited', rateLimitInfo);
    })
})
