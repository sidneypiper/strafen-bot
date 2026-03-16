import db from '../database/data-source';
import Command from '../core/Command';

const AVAILABLE_SETTINGS = [
    {name: 'Currency', value: 'currency'}
]

const DEFAULT_SETTINGS: Record<string, string> = {
    currency: '$'
}

export default new Command('settings')
    .setBuilder(builder => builder
        .setDescription('Change settings.')
        .addSubcommand(subcommand => subcommand
            .setName('reset')
            .setDescription('Reset a setting to its default value.')
            .addStringOption(option =>
                option.setName('setting')
                    .setDescription('The setting to reset.')
                    .setRequired(true)
                    .addChoices(AVAILABLE_SETTINGS)))
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('Set a setting to a new value.')
            .addStringOption(option =>
                option.setName('setting')
                    .setDescription('The setting to set.')
                    .setRequired(true)
                    .addChoices(AVAILABLE_SETTINGS))
            .addStringOption(option =>
                option.setName('value')
                    .setDescription('The new value for the setting.')
                    .setMaxLength(3)
                    .setRequired(true))))
    .setHandler(async interaction => {
        await interaction.deferReply()

        const guild = interaction.guild!;
        const setting = interaction.options.getString('setting', true)

        switch (interaction.options.getSubcommand()) {
            case 'reset':
                db.guildSettings.updateSetting(guild.id, setting, DEFAULT_SETTINGS[setting])
                await interaction.editReply(`Reset ${setting} to default value.`)
                break;
            case 'set':
                const value = interaction.options.getString('value', true)
                db.guildSettings.updateSetting(guild.id, setting, value)
                await interaction.editReply(`Set ${setting} to ${value}.`)
                break;
        }
    });
