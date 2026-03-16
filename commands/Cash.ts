import {EmbedBuilder, GuildMember} from 'discord.js';
import Command from '../core/Command';
import {LOGO_URL} from '../core/Helpers';
import db from '../database/data-source';

export default new Command('cash')
    .setBuilder(builder =>
        builder.setDescription('Shows general or user-specific stats.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to get information about.')
                    .setRequired(false)))
    .setHandler(async interaction => {
        await interaction.deferReply();

        const guild = interaction.guild!;
        const member = interaction.options.getMember('user') as GuildMember | null;

        if (!member) {
            const infractions = db.infraction.generalStats(guild.id)

            const user_ids = infractions.map(infraction => infraction.user_id)
            const members = await guild.members.fetch({user: user_ids})

            const names = infractions.map(infraction => members.get(infraction.user_id)!.displayName).join('\n') || '\n';
            const counts = infractions.map(infraction => infraction.count_penalty + 'x').join('\n') || '\n';
            const sums = infractions.map(infraction => infraction.sum_penalty_price + '€').join('\n') || '\n';

            const sum = infractions.reduce((acc, x) => acc + x.sum_penalty_price, 0)

            const embed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle('Cash Stats (' + sum + '€)')
                .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setDescription('All time cash stats')
                .addFields([
                    {name: 'User', value: names, inline: true},
                    {name: 'Count', value: counts, inline: true},
                    {name: 'Sum', value: sums, inline: true}
                ])

            await interaction.editReply({embeds: [embed]});
        } else {
            const infractions = db.infraction.userStats(guild.id, member.id)

            const infraction_names = infractions.map(infraction => infraction.penalty_name).join('\n') || '\n'
            const counts = infractions.map(infraction => infraction.count_penalty + 'x').join('\n') || '\n'
            const sums = infractions.map(infraction => infraction.sum_penalty_price + '€').join('\n') || '\n'

            const sum = infractions.reduce((acc, x) => acc + x.sum_penalty_price, 0)

            const embed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle('Cash Stats for ' + member.displayName + ' (' + sum + '€)')
                .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setDescription('All time cash stats for ' + member.displayName)
                .addFields([
                    {name: 'Infraction', value: infraction_names, inline: true},
                    {name: 'Count', value: counts, inline: true},
                    {name: 'Sum', value: sums, inline: true}
                ])

            await interaction.editReply({embeds: [embed]})
        }
    });
