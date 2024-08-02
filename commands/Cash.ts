import {EmbedBuilder} from 'discord.js';
import Command from '../core/Command';
import {LOGO_URL} from '../core/Helpers';
import getDatabase from '../database/data-source';
import {Infraction} from '../database/entity/Infraction';

export default new Command('cash')
    .setBuilder(builder =>
        builder.setDescription('Shows general or user-specific stats.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to get information about.')
                    .setRequired(false)))
    .setHandler(async interaction => {
        await interaction.deferReply();

        const database = await getDatabase();

        // @ts-ignore
        const member = interaction.options.getMember('user') || null;

        if (!member) { // Show general stats
            const infractions = await database
                .getRepository(Infraction)
                .createQueryBuilder('infraction')
                .innerJoinAndSelect('infraction.penalty', 'penalty')
                .select('infraction.user_id', 'user_id')
                .addSelect('COUNT(*)', 'count_penalty')
                .addSelect('SUM(penalty.price)', 'sum_penalty_price')
                .where('infraction.guild_id = :guild_id', {guild_id: interaction.guild.id})
                .groupBy('infraction.user_id')
                .orderBy('sum_penalty_price', 'DESC')
                .getRawMany()

            const user_ids = infractions.map(infraction => infraction.user_id)

            // @ts-ignore
            const members = await interaction.guild.members.fetch({user: user_ids, force: true})

            const names = infractions.map(infraction => members.get(infraction.user_id).displayName).join('\n') || '\n';
            const counts = infractions.map(infraction => infraction.count_penalty + 'x').join('\n') || '\n';
            const sums = infractions.map(infraction => infraction.sum_penalty_price + '€').join('\n') || '\n';

            const sum = infractions.reduce((acc, x) => acc + x.sum_penalty_price, 0)

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Cash Stats (' + sum + '€)')
                .setAuthor({name: interaction.guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setDescription('All time cash stats')
                .addFields([
                    {name: 'User', value: names, inline: true},
                    {name: 'Count', value: counts, inline: true},
                    {name: 'Sum', value: sums, inline: true}

                ])

            await interaction.editReply({embeds: [embed]});
        } else {
            const infractions = await database
                .getRepository(Infraction)
                .createQueryBuilder('infraction')
                .innerJoinAndSelect('infraction.penalty', 'penalty')
                .select('penalty.name', 'penalty_name')
                .addSelect('COUNT(*)', 'count_penalty')
                .addSelect('SUM(penalty.price)', 'sum_penalty_price')
                .where('infraction.guild_id = :guild_id', {guild_id: interaction.guild.id})
                .andWhere('infraction.user_id = :user_id', {user_id: member.id})
                .groupBy('penalty_name')
                .orderBy('sum_penalty_price', 'DESC')
                .getRawMany()

            const infraction_names = infractions.map(infraction => infraction.penalty_name).join('\n') || '\n'
            const counts = infractions.map(infraction => infraction.count_penalty + 'x').join('\n') || '\n'
            const sums = infractions.map(infraction => infraction.sum_penalty_price + '€').join('\n') || '\n'

            const sum = infractions.reduce((acc, x) => acc + x.sum_penalty_price, 0)

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Cash Stats for ' + member.displayName + ' (' + sum + '€)')
                .setAuthor({name: interaction.guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setDescription('All time cash stats for ' + member.displayName)
                .addFields([
                    {name: 'Infraction', value: infraction_names, inline: true},
                    {name: 'Count', value: counts, inline: true},
                    {name: 'Sum', value: sums, inline: true}
                ])

            await interaction.editReply({embeds: [embed]})
        }
    });
