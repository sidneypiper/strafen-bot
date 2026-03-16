import {ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember, MessageFlags, PollLayoutType} from 'discord.js'
import Command from '../core/Command'
import db from '../database/data-source'
import type {Penalty} from '../database/entity/Penalty'
import {filter} from 'fuzzaldrin-plus'

const TIME_TO_DISPUTE = 1_000 * 60
const TIME_TO_VOTE    = 1_000 * 60

function persistPenalty(guildId: string, userId: string, penalty: Penalty) {
    db.infraction.insert(userId, guildId, penalty.id)
}

export default new Command('add')
    .setBuilder(builder => {
        return builder
            .setDescription('Blame a user for a penalty.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to blame.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('penalty')
                    .setDescription('The penalty to assign.')
                    .setRequired(true)
                    .setAutocomplete(true))
    })
    .setAutocomplete(async interaction => {
        const penalties = db.penalty.findNamesByGuild(interaction.guild!.id)
        const input = interaction.options.getFocused()
        const possible = penalties.map(p => p.name)
        if (!input || input.length === 0) return possible
        return filter(possible, input)
    })
    .setHandler(async interaction => {
        await interaction.deferReply({flags: MessageFlags.Ephemeral})

        const guild = interaction.guild!
        const blamee = interaction.user
        const blamed = interaction.options.getMember('user') as GuildMember | null
        if (!blamed) throw new Error('Member not found.')

        if (blamed.id === blamee.id) {
            await interaction.editReply(`:warning: You can't blame yourself.`)
            return
        }

        const penaltyName = interaction.options.getString('penalty', true)
        const penalty = db.penalty.findByGuildAndName(guild.id, penaltyName.trim())
        if (!penalty) {
            await interaction.editReply(`:warning: No penalty named **${penaltyName}** found.`)
            return
        }

        await interaction.editReply(`✅ You blamed **${blamed.displayName}** for **${penalty.name}**.`)

        const publicBlame = await interaction.followUp({
            content: `${blamed.toString()} — you've been blamed for **${penalty.name}** (${penalty.price}€) by **${blamee.displayName}**.\nDispute within 1 minute if you think this is wrong.`,
            components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('dispute').setLabel(`I didn't do that!`).setStyle(ButtonStyle.Danger)
            )]
        })

        try {
            const disputeInteraction = await publicBlame.awaitMessageComponent({
                filter: i => i.user.id === blamed.id && i.customId === 'dispute',
                time: TIME_TO_DISPUTE
            })

            await disputeInteraction.reply({
                content: `You've disputed the blame. A vote is now running for 1 minute.`,
                flags: MessageFlags.Ephemeral
            })

            const voteMessage = await interaction.followUp({poll: {
                question: {text: `Did ${blamed.displayName} commit: ${penalty.name}?`},
                answers: [{text: 'Guilty 👮', emoji: '👮'}, {text: 'Innocent ⚖️', emoji: '⚖️'}],
                allowMultiselect: false,
                duration: 1,
                layoutType: PollLayoutType.Default
            }})

            await publicBlame.edit({
                content: `🗳️ **${blamed.displayName}** disputed the blame! A vote is running for 1 minute.`,
                components: []
            })

            setTimeout(async () => {
                const vote = await voteMessage.poll!.end()
                const answers = vote.poll!.answers
                const guiltyVotes = answers.get(1)!.voteCount
                const innocentVotes = answers.get(2)!.voteCount

                let result: string
                if (guiltyVotes > innocentVotes) {
                    result = `⚖️ Guilty! The crowd voted **${guiltyVotes}–${innocentVotes}**. **${penalty.name}** (${penalty.price}€) stands.`
                    persistPenalty(guild.id, blamed.id, penalty)
                } else if (innocentVotes > guiltyVotes) {
                    result = `🎉 Innocent! The crowd voted **${innocentVotes}–${guiltyVotes}** in favour of **${blamed.displayName}**. No fine applied.`
                } else {
                    result = `🤝 Tie vote — in dubio pro reo. **${blamed.displayName}** gets the benefit of the doubt.`
                }

                await publicBlame.edit({content: result, components: []})
                await vote.delete()
            }, TIME_TO_VOTE)

        } catch {
            await publicBlame.edit({
                content: `⏰ Time's up, **${blamed.displayName}**. No dispute within 1 minute. **${penalty.name}** (${penalty.price}€) is confirmed.`,
                components: []
            })
            persistPenalty(guild.id, blamed.id, penalty)
        }
    })
