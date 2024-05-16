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
        
        const members = await interaction.guild.members.fetch();
        
        if (!user) { // Show general stats
            const infractions = (await database
                .getRepository(Infraction)
                .createQueryBuilder('infraction')
                .innerJoinAndSelect('infraction.penalty', 'penalty')
                .select('infraction.user_id', 'user_id')
                .addSelect('COUNT(*)', 'count_penalty')
                .addSelect('SUM(penalty.price)', 'sum_penalty_price')
                .where('infraction.guild_id = :guild_id', { guild_id: interaction.guild.id })
                .groupBy('infraction.user_id')
                .getRawMany())
                .map(infraction => {
                    return {
                        username: members.get(infraction.user_id)?.user.displayName || 'Unknown',
                        count_penalty: infraction.count_penalty,
                        sum_penalty_price: infraction.sum_penalty_price
                    };
                });
            
            const names = infractions.map(infraction => infraction.username).join('\n');
            const counts = infractions.map(infraction => infraction.count_penalty + 'x').join('\n');
            const sums = infractions.map(infraction => infraction.sum_penalty_price + '€').join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Cash Stats')
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('All time cash stats')
                .addFields([
                    { name: 'User', value: names, inline: true },
                    { name: 'Count', value: counts, inline: true },
                    { name: 'Sum', value: sums, inline: true }
                
                ])

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
                .groupBy('penalty_name')
                .getRawMany();
            
            const infraction_names = infractions.map(infraction => infraction.penalty_name).join('\n');
            const counts = infractions.map(infraction => infraction.count_penalty + 'x').join('\n');
            const sums = infractions.map(infraction => infraction.sum_penalty_price + '€').join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Cash Stats for ' + user.user.displayName)
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('All time cash stats for ' + user.user.displayName)
                .addFields([
                    { name: 'Infraction', value: infraction_names, inline: true },
                    { name: 'Count', value: counts, inline: true },
                    { name: 'Sum', value: sums, inline: true }
                
                ])

            await interaction.reply({ embeds: [embed] });
        }
    });
