import { EmbedBuilder } from 'discord.js';
import Command from '../core/Command';
import { logoUrl } from '../core/Helpers';
import database from '../database/data-source';
import { Infraction } from '../database/entity/Infraction';

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
            const infractions = await database
                .getRepository(Infraction)
                .createQueryBuilder('infraction')
                .innerJoinAndSelect('infraction.penalty', 'penalty')
                .select('infraction.user_id', 'user_id')
                .addSelect('COUNT(*)', 'count_penalty')
                .addSelect('SUM(penalty.price)', 'sum_penalty_price')
                .where('infraction.guild_id = :guild_id', { guild_id: interaction.guild.id })
                .groupBy('infraction.user_id')
                .getRawMany();

            console.log(infractions);

            embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Cash Stats')
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('All time cash stats')
                
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            const infractions = await database
                .getRepository(Infraction)
                .createQueryBuilder('infraction')
                .innerJoinAndSelect('infraction.penalty', 'penalty')
                .select('penalty.name', 'penalty_name')
                .addSelect('COUNT(*)', 'count_penalty')
                .addSelect('SUM(penalty.price)', 'sum_penalty_price')
                .where('infraction.guild_id = :guild_id', { guild_id: interaction.guild.id })
                .andWhere('infraction.user_id = :user_id', { user_id: user.id })
                .groupBy('penalty.id')
                .getRawMany();

            console.log(infractions);
        }
    });
