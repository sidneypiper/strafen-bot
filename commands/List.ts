import { EmbedBuilder } from 'discord.js';
import { logoUrl } from '../core/Helpers';
import database from '../database/data-source';
import { Penalty } from '../database/entity/Penalty';
import Command from '../core/Command';

export default new Command('list')
    .setBuilder(builder => builder.setDescription('Shows available penalties.'))
    .setHandler(async interaction => {
        await interaction.deferReply()

        const penalties = await database
            .getRepository(Penalty)
            .createQueryBuilder('penalty')
            .select('penalty.name', 'name')
            .addSelect('penalty.description', 'description')
            .addSelect('penalty.price', 'price')
            .where('penalty.guild_id = :guild_id', { guild_id: interaction.guild.id })
            .getRawMany()

        const names  = penalties.map(p => p.name).join('\n');
        const descs = penalties.map(p => p.description.replaceAll(' ', '\xa0')).join('\n');
        const prices   = penalties.map(p => p.price + '€').join('\n');

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Penalties List')
            .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
            .setDescription('All available penalties')
            .addFields([
                { name: 'Penalty', value: names, inline: true },
                { name: 'Description', value: descs, inline: true },
                { name: 'Price', value: prices, inline: true }
            ])

        await interaction.editReply({ embeds: [embed] });
});
