import {GuildMember, MessageFlags} from 'discord.js'
import Command from '../core/Command'
import db from '../database/data-source'
import {filter} from 'fuzzaldrin-plus'

export default new Command('force-add')
    .setBuilder(builder => {
        return builder
            .setDescription('Only use as administrator. Debug ONLY.')
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
        const blamed = interaction.options.getMember('user') as GuildMember | null
        if (!blamed) throw new Error('Member not found.')

        const penaltyName = interaction.options.getString('penalty', true)

        const penalty = db.penalty.findByGuildAndName(guild.id, penaltyName.trim())
        if (!penalty) {
            await interaction.editReply({
                content: `:warning: The penalty with the name ${penaltyName} does not exist.`,
            })
            return
        }

        db.infraction.insert(blamed.id, guild.id, penalty.id)
        await interaction.editReply({
            content: `Successfully added the penalty ${penalty.name} to ${blamed.displayName}.`,
        })
    })
