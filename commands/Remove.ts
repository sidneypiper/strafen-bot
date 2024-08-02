import {EmbedBuilder} from 'discord.js';
import Command from '../core/Command';
import {LOGO_URL} from '../core/Helpers';
import getDatabase from '../database/data-source';
import {Penalty} from '../database/entity/Penalty';
import {filter} from 'fuzzaldrin-plus';
import {Equal, ILike} from 'typeorm';

export default new Command('remove')
    .setBuilder(builder => {
        return builder
            .setDescription('Remove a penalty from the server.')
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('The name of the penalty to remove.')
                    .setRequired(true)
                    .setAutocomplete(true))
    })
    .setAutocomplete(async interaction => {
        const database = await getDatabase();

        const penalties = await database.manager.find(Penalty, {
            select: ['name'],
            where: {
                guild_id: interaction.guild.id
            }
        });

        const input = interaction.options.getFocused();
        const possible = penalties.map(penalty => penalty.name);

        if (input === null || input.length === 0) return possible;

        return filter(possible, input);
    })
    .setHandler(async interaction => {
        await interaction.deferReply();

        const database = await getDatabase();

        // @ts-ignore
        const name = interaction.options.getString('name');

        database.getRepository(Penalty).findOneByOrFail({
            guild_id: Equal(interaction.guild.id),
            name: ILike(name.trim()),
        }).then(async (p) => {
            await database.manager.remove(p);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Removed penalty')
                .setAuthor({name: interaction.guild.name + ' Strafenbot', iconURL: LOGO_URL})
                .setDescription('Successfully removed penalty: ' + name)

            await interaction.editReply({embeds: [embed]});
        }).catch((err) => {
            if (err.code === "SQLITE_CONSTRAINT") {
                interaction.editReply({
                    content: `:warning: The penalty with the name ${name} is still in use and cannot be deleted.`,
                });
                return;
            }

            interaction.editReply({
                content: `:warning: The penalty with the name ${name} does not exist.`,
            });
        });
    });
