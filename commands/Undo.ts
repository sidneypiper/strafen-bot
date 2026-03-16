import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from 'discord.js';
import Command from '../core/Command';
import db from '../database/data-source';

export default new Command('undo')
    .setBuilder(builder => builder.setDescription('Undo your most recent blame.'))
    .setHandler(async interaction => {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const guild = interaction.guild!;
        const blamee = interaction.user;

        const infraction = db.infraction.findLatest(guild.id, blamee.id)
        if (!infraction) {
            await interaction.editReply(`:warning: Nothing to undo.`);
            return
        }

        const blamed = await guild.members.fetch(infraction.user_id);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('confirm').setLabel('Confirm').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger),
        );

        const confirmationMessage = await interaction.editReply({
            content: `Are you sure you want to undo blaming **${blamed.displayName}** for **${infraction.penalty_name}**?`,
            components: [row],
        });

        try {
            const confirmation = await confirmationMessage.awaitMessageComponent({
                filter: i => i.user.id === blamee.id,
                time: 60_000
            });

            if (confirmation.customId === 'cancel') {
                await confirmation.update({content: `Undo cancelled.`, components: []});
            } else if (confirmation.customId === 'confirm') {
                db.infraction.delete(infraction.id)
                await confirmation.update({content: `Blame on **${blamed.displayName}** for **${infraction.penalty_name}** has been undone.`, components: []});
            }
        } catch {
            await confirmationMessage.edit({content: `Timed out. Undo cancelled.`, components: []});
        }
    });
