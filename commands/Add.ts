import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, MessageFlags, PollLayoutType} from 'discord.js'
import Command from '../core/Command'
import {LOGO_URL} from '../core/Helpers'
import db from '../database/data-source'
import type {Penalty} from '../database/entity/Penalty'
import {filter} from 'fuzzaldrin-plus'

const TIME_TO_DISPUTE = 1_000 * 60 * 60
const TIME_TO_VOTE = 1_000 * 60 * 60

function persistPenalty(guildId: string, userId: string, penalty: Penalty) {
    db.infraction.insert(userId, guildId, penalty.id)
}

export default new Command('add')
    .setBuilder(builder => {
        return builder
            .setDescription('Blame a user for a penalty.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The name of the user to blame.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('penalty')
                    .setDescription('The name of the penalty.')
                    .setRequired(true)
                    .setAutocomplete(true))
    })
    .setAutocomplete(async interaction => {
        const penalties = db.penalty.findNamesByGuild(interaction.guild!.id)

        const input = interaction.options.getFocused()
        const possible = penalties.map(p => p.name)

        if (input === null || input.length === 0) return possible

        return filter(possible, input)
    })
    .setHandler(async interaction => {
        await interaction.deferReply({flags: MessageFlags.Ephemeral})

        const guild = interaction.guild!
        const blamee = interaction.user
        const blamed = interaction.options.getMember('user') as GuildMember | null
        if (!blamed) throw new Error('Member not found.')

        const penaltyName = interaction.options.getString('penalty')!

        const penalty = db.penalty.findByGuildAndName(guild.id, penaltyName.trim())
        if (!penalty) {
            await interaction.editReply({
                content: `:warning: The penalty with the name ${penaltyName} does not exist.`,
            })
            return
        }

        const blamerMessage = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`You successfully blamed ${blamed.displayName} for ${penalty.name}`)
            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})

        await interaction.editReply({embeds: [blamerMessage]})

        const dispute = new ButtonBuilder()
            .setCustomId('dispute')
            .setLabel('I didn\'t do that!!')
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(dispute)

        const publicBlameEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Arghhh ${blamed.displayName}! ${blamee.displayName} blamed you for ${penalty.name}`)
            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
            .setDescription('If you think this is wrong, click the button below to dispute the blame. You only have 1 hour to do so though!')

        const publicBlame = await interaction.followUp({
            content: blamed.toString(),
            embeds: [publicBlameEmbed],
            components: [row]
        })

        const collectorFilterDispute = (i: { user: { id: string }; customId: string }) => {
            return i.user.id === blamed.id && i.customId === 'dispute'
        }

        try {
            await publicBlame.awaitMessageComponent({filter: collectorFilterDispute, time: TIME_TO_DISPUTE})

            const disputeEmbedTie = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`You disputed the blame ${blamed.displayName}!`)
                .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setDescription(`You now have the chance to tell others why you shouldn't be penalized for ${penalty.name}.\n\nOutsiders can now vote for ${Math.floor(TIME_TO_VOTE / 60_000.00)} minutes on whether you are guilty or not.\n\nAs soon as one outsider votes, the voting will end and the result will be displayed.`)

            const poll = {
                question: {text: `Is ${blamed.displayName} guilty of ${penalty.name}? (1h)`},
                answers: [
                    {text: 'Yes', emoji: '👮'},
                    {text: 'No', emoji: '⚖️'}
                ],
                allowMultiselect: false,
                duration: 1,
                layoutType: PollLayoutType.Default
            }

            const voteMessage = await interaction.followUp({poll})

            setTimeout(async () => {
                const vote = await voteMessage.poll!.end()
                const result = vote.poll!.answers

                let resultEmbed: EmbedBuilder | undefined

                switch (Math.sign(result.get(1)!.voteCount - result.get(2)!.voteCount)) {
                    case -1:
                        resultEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                            .setTitle(`The crowd is cheering for you, ${blamed.displayName}! You are free to go.`)
                            .setDescription(`${blamee.displayName} failed to blame you for ${penalty.name}.`)
                        break
                    case 0:
                        resultEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                            .setTitle(`In dubio pro reo, ${blamed.displayName}!`)
                            .setDescription(`${blamee.displayName} failed to blame you for ${penalty.name}.`)
                        break
                    case 1:
                        resultEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                            .setTitle(`Unfortunately, you have been found guilty ${blamed.displayName}!`)
                            .setDescription(`${blamee.displayName} successfully blamed you for ${penalty.name} which costs you ${penalty.price}€.`)
                        persistPenalty(guild.id, blamed.id, penalty)
                        break
                }

                await publicBlame.edit({
                    content: null,
                    embeds: [resultEmbed!],
                    components: []
                })

                await vote.delete();
            }, TIME_TO_VOTE)

        } catch (e) {
            const notInTimeEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setTitle(`Too late ${blamed.displayName}!`)
                .setDescription(`${blamee.displayName} blamed you for ${penalty.name} and you didn't dispute the blame in time. You are now officially blamed for ${penalty.name} which costs you ${penalty.price}€.`)

            await publicBlame.edit({
                content: null,
                embeds: [notInTimeEmbed],
                components: []
            })

            persistPenalty(guild.id, blamed.id, penalty)
            return
        }
    })
