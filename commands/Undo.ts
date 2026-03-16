import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags} from 'discord.js';
import Command from '../core/Command';
import {LOGO_URL} from '../core/Helpers';
import db from '../database/data-source';

export default new Command('undo')
    .setBuilder(builder => builder.setDescription('Undo your most recent blame.'))
    .setHandler(async interaction => {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const guild = interaction.guild!;
        const blamee = interaction.user;

        const infraction = db.infraction.findLatest(guild.id, blamee.id)
        if (!infraction) {
            await interaction.editReply({
                content: `:warning: Nothing to undo for you.`,
            });
            return
        }

        const blamed = await guild.members.fetch(infraction.user_id);

        const confirmationEmbed = new EmbedBuilder()
            .setColor(0x7289DA)
            .setTitle(`Are you sure you want to undo you blaming ${blamed.displayName} for ${infraction.penalty_name}?`)
            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirm, cancel);

        const confirmationMessage = await interaction.editReply({
            content: blamee.toString(),
            embeds: [confirmationEmbed],
            components: [row],
        });

        const collectorFilterConfirmation = (i: { user: { id: string } }) => {
            return i.user.id === blamee.id;
        };

        try {
            const confirmation = await confirmationMessage.awaitMessageComponent({
                filter: collectorFilterConfirmation,
                time: 60_000
            });

            if (confirmation.customId === 'cancel') {
                const confirmationCancelEmbed = new EmbedBuilder()
                    .setColor(0x7289DA)
                    .setTitle(`You decided not to undo the blame!`)
                    .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL});

                await confirmationMessage.edit({
                    content: null,
                    embeds: [confirmationCancelEmbed],
                    components: []
                });

                return;
            } else if (confirmation.customId === 'confirm') {
                db.infraction.delete(infraction.id)

                const confirmationSuccessEmbed = new EmbedBuilder()
                    .setColor(0x7289DA)
                    .setTitle(`You undid the blame! Really nice of you ${blamed.displayName}!`)
                    .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL});

                await confirmationMessage.edit({
                    content: null,
                    embeds: [confirmationSuccessEmbed],
                    components: []
                });

                return;
            }
        } catch (e) {
            const notInTimeEmbed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle(`You didn't confirm in time, the undo was canceled!`)
                .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})

            await confirmationMessage.edit({
                content: null,
                embeds: [notInTimeEmbed],
                components: []
            })

            return;
        }
    });
