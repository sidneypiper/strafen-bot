import Command from '../core/Command'
import getDatabase from '../database/data-source'
import {Penalty} from '../database/entity/Penalty'
import {filter} from 'fuzzaldrin-plus'
import {DataSource, Equal, ILike} from 'typeorm'
import {Infraction} from '../database/entity/Infraction'

async function persistPenalty(database: DataSource, guildId: string, userId: string, penalty: Penalty) {
    await database.getRepository(Infraction).insert({
        guild_id: guildId,
        user_id: userId,
        penalty: penalty
    })
}

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
        const database = await getDatabase()

        const penalties = await database.manager.find(Penalty, {
            select: ['name'],
            where: {
                guild_id: interaction.guild.id
            }
        })

        const input = interaction.options.getFocused()
        const possible = penalties.map(penalty => penalty.name)

        if (input === null || input.length === 0) return possible

        return filter(possible, input)
    })
    .setHandler(async interaction => {
        await interaction.deferReply({ephemeral: true})

        const database = await getDatabase()

        // @ts-ignore
        const blamed = interaction.options.getMember('user')

        // @ts-ignore
        const penalty = interaction.options.getString('penalty')

        database.getRepository(Penalty).findOneByOrFail({
            guild_id: Equal(interaction.guild.id),
            name: ILike(penalty.trim()),
        }).then(async (penalty) => {
            await persistPenalty(database, interaction.guild.id, blamed.id, penalty);
            await interaction.editReply({
                content: `Successfully added the penalty ${penalty.name} to ${blamed.displayName}.`,
            })
        }).catch(async () => {
            await interaction.editReply({
                content: `:warning: The penalty with the name ${penalty} does not exist.`,
            })
        })
    })
