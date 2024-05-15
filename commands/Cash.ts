import { EmbedBuilder } from 'discord.js';
import Command from '../core/Command';
import { logoUrl } from '../core/Helpers';

export default new Command('cash')
    .setBuilder(builder =>
        builder.setDescription('Shows general or user-specific stats.')
               .addUserOption(option =>
                    option.setName('user')
                          .setDescription('The user to get information about.')
                          .setRequired(false)))
    .setHandler(async interaction => {
        // @ts-ignore
        const user = interaction.options.getMember('user') || null;
        console.log(interaction.guild.name);
        let embed = null;

        if (!user) { // Show general stats
            embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Test')
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('Some description here')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    });
