import { EmbedBuilder } from 'discord.js';
import Command from '../core/Command';
import { logoUrl } from '../core/Helpers';
import database from '../database/data-source';
import { Penalty } from '../database/entity/Penalty';

export default new Command('create')
    .setBuilder(builder =>
        builder.setDescription('Add a penalty to the server.')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('The name of the penalty.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('description')
                    .setDescription('The description of the penalty.')
                    .setRequired(true))
            .addNumberOption(option =>
                option.setName('price')
                    .setDescription('The price of the penalty.')
                    .setRequired(true)))

    .setHandler(async interaction => {
            // @ts-ignore
            const name = interaction.options.getString('name')

            // @ts-ignore
            const description = interaction.options.getString('description')

            // @ts-ignore
            const price = interaction.options.getNumber('price')

            await database.manager.insert(Penalty, {
                name: name,
                description: description,
                price: price,
                guild_id: interaction.guild.id
            });

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('New penalty')
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('Successfully added new penalty: ' + name)

            await interaction.reply({ embeds: [embed] });
});
