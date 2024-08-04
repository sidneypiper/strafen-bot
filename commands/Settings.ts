import getDatabase from '../database/data-source';
import Command from '../core/Command';
import {GuildSettings} from "../database/entity/GuildSettings";

const AVAILABLE_SETTINGS = [
    {name: 'Currency', value: 'currency'}
]

const DEFAULT_SETTINGS = {
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

        const database = await getDatabase();

        const setting = interaction.options.getString('setting', true)

        switch (interaction.options.getSubcommand()) {
            case 'reset':
                await database
                    .getRepository(GuildSettings)
                    .createQueryBuilder()
                    .update()
                    .set({[setting]: DEFAULT_SETTINGS[setting]})
                    .where('id = :id', {id: interaction.guild.id})
                    .execute()

                await interaction.editReply(`Reset ${setting} to default value.`)
                break;
            case 'set':
                const value = interaction.options.getString('value', true)

                await database
                    .getRepository(GuildSettings)
                    .createQueryBuilder()
                    .update()
                    .set({[setting]: value})
                    .where('id = :id', {id: interaction.guild.id})
                    .execute()

                await interaction.editReply(`Set ${setting} to ${value}.`)
                break;
        }
    });
