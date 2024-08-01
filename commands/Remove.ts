import { EmbedBuilder } from 'discord.js';
import Command from '../core/Command';
import { logoUrl } from '../core/Helpers';
import database from '../database/data-source';
import { Penalty } from '../database/entity/Penalty';
import { filter } from 'fuzzaldrin-plus';
import { Equal, ILike } from 'typeorm';

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
        const penalties = await database.manager.find(Penalty, {
            select: ['name'],
            where: {
                guild_id: interaction.guild.id
            }
        });

        const input = interaction.options.getFocused(); 
        const possible = penalties.map(penalty => penalty.name);

        if(input === null || input.length === 0) return possible;

        return filter(possible, input);
    })
    .setHandler(async interaction => {
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
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('Successfully removed penalty: ' + name)

            await interaction.reply({ embeds: [embed] });
        }).catch((err) => {
            if(err.code === "SQLITE_CONSTRAINT") {
                interaction.reply({
                    content: `:warning: The penalty with the name ${name} is still in use and cannot be deleted.`,
                    ephemeral: true
                });
                return;
            }

            interaction.reply({
                content: `:warning: The penalty with the name ${name} does not exist.`,
                ephemeral: true
            });
        });
    });
