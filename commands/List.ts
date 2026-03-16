import {AttachmentBuilder} from 'discord.js';
import db from '../database/data-source';
import Command from '../core/Command';
import genImageOfList from "../views/List";

export default new Command('list')
    .setBuilder(builder => builder.setDescription('Shows available penalties.'))
    .setHandler(async interaction => {
        await interaction.deferReply()

        const penalties = db.penalty.list(interaction.guild!.id)
        const imageBuffer = await genImageOfList(penalties)
        const attachment = new AttachmentBuilder(imageBuffer, {name: "penalties.png"})

        await interaction.editReply({files: [attachment]});
    });
