import {AttachmentBuilder, EmbedBuilder} from 'discord.js';
import {LOGO_URL} from '../core/Helpers';
import db from '../database/data-source';
import Command from '../core/Command';
import genImageOfList from "../views/List";

export default new Command('list')
    .setBuilder(builder => builder.setDescription('Shows available penalties.'))
    .setHandler(async interaction => {
        await interaction.deferReply()

        const guild = interaction.guild!;
        const penalties = db.penalty.list(guild.id)

        const imageBuffer = await genImageOfList(penalties)

        const attachment = new AttachmentBuilder(imageBuffer, {name: "penalties.png"})

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Penalties List')
            .setAuthor({name: guild.name + ' Strafenbot', iconURL: LOGO_URL})
            .setDescription('All available penalties. Click the image below to enlarge.')
            .setImage('attachment://penalties.png')

        await interaction.editReply({embeds: [embed], files: [attachment]});
    });
