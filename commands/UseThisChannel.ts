import {MessageFlags, PermissionFlagsBits} from 'discord.js';
import Command from '../core/Command';
import db from '../database/data-source';

export default new Command('use-this-channel')
    .setBuilder(builder =>
        builder.setDescription('Set or unset this channel for bot announcements.')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addBooleanOption(option =>
                option.setName('disable')
                    .setDescription('Disable announcements for this server.')
                    .setRequired(false)))
    .setHandler(async interaction => {
        const guild = interaction.guild!;

        const disable = interaction.options.getBoolean('disable') ?? false;

        // Ensure guild settings exist
        const existing = db.guildSettings.find(guild.id);
        if (!existing) {
            db.guildSettings.upsert(guild.id, '$');
        }

        if (disable) {
            db.guildSettings.setAnnouncementChannel(guild.id, null);
            await interaction.reply({
                content: 'Announcements disabled. I\'ll stay quiet... for now.',
                flags: MessageFlags.Ephemeral
            });
        } else {
            db.guildSettings.setAnnouncementChannel(guild.id, interaction.channelId);
            await interaction.reply({
                content: `Got it. I'll announce my glorious return in this channel from now on.`,
                flags: MessageFlags.Ephemeral
            });
        }
    });
