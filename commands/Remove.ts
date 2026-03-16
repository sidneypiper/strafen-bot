import Command from '../core/Command';
import db from '../database/data-source';
import {filter} from 'fuzzaldrin-plus';

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
        const penalties = db.penalty.findNamesByGuild(interaction.guild!.id)
        const input = interaction.options.getFocused();
        const possible = penalties.map(p => p.name);
        if (input === null || input.length === 0) return possible;
        return filter(possible, input);
    })
    .setHandler(async interaction => {
        await interaction.deferReply();

        const guild = interaction.guild!;
        const name = interaction.options.getString('name', true);

        const penalty = db.penalty.findByGuildAndName(guild.id, name.trim())
        if (!penalty) {
            await interaction.editReply(`:warning: No penalty named **${name}** found.`);
            return
        }

        try {
            db.penalty.delete(penalty.id);
            await interaction.editReply(`**${name}** has been removed.`);
        } catch (err: any) {
            if (err.message?.includes("FOREIGN KEY")) {
                await interaction.editReply(`:warning: **${name}** is still in use and cannot be deleted.`);
                return;
            }
            throw err;
        }
    });
