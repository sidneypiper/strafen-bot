import {AttachmentBuilder, GuildMember} from 'discord.js';
import Command from '../core/Command';
import db from '../database/data-source';
import {genLeaderboardImage} from '../views/Leaderboard';
import {genUserStatsImage} from '../views/UserStats';

export default new Command('cash')
    .setBuilder(builder =>
        builder.setDescription('Shows the fine leaderboard or stats for a specific user.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('Show stats for a specific user.')
                    .setRequired(false)))
    .setHandler(async interaction => {
        await interaction.deferReply();

        const guild = interaction.guild!;
        const member = interaction.options.getMember('user') as GuildMember | null;

        if (!member) {
            const stats = db.infraction.generalStats(guild.id)
            const members = await guild.members.fetch({user: stats.map(s => s.user_id)})

            const entries = stats.map(s => ({
                userId: s.user_id,
                displayName: members.get(s.user_id)?.displayName ?? 'Unknown',
                avatarUrl: members.get(s.user_id)?.user.displayAvatarURL({extension: 'png'}) ?? null,
                totalFines: s.sum_penalty_price,
                count: s.count_penalty,
            }))

            const imageBuffer = await genLeaderboardImage(entries)
            const attachment = new AttachmentBuilder(imageBuffer, {name: 'leaderboard.png'})
            await interaction.editReply({files: [attachment]})
        } else {
            const stats = db.infraction.userStats(guild.id, member.id)
            const totalFines = stats.reduce((acc, s) => acc + s.sum_penalty_price, 0)

            const imageBuffer = await genUserStatsImage(
                member.displayName,
                member.user.displayAvatarURL({extension: 'png'}),
                totalFines,
                stats.map(s => ({penaltyName: s.penalty_name, count: s.count_penalty, total: s.sum_penalty_price}))
            )
            const attachment = new AttachmentBuilder(imageBuffer, {name: 'stats.png'})
            await interaction.editReply({files: [attachment]})
        }
    });
