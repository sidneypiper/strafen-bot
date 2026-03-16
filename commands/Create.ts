import Command from '../core/Command';
import db from '../database/data-source';

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
        await interaction.deferReply();

        const guild = interaction.guild!;
        const name = interaction.options.getString('name', true)
        const description = interaction.options.getString('description', true)
        const price = interaction.options.getNumber('price', true)

        db.penalty.insert(name, description, price, guild.id);

        await interaction.editReply(`**${name}** has been added. It'll cost **${price}€**. Consider yourself warned.`);
    });
