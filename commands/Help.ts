import { EmbedBuilder } from 'discord.js';
import Command from '../core/Command';
import { logoUrl } from '../core/Helpers';

export default new Command('helpm')
    .setBuilder(builder => {
        return builder
            .setDescription('Show available commands.')
    })
    .setHandler(async interaction => {
        const commands = {
            '/add': 'Add a penalty to a user.',
            '/cash': 'List current cash of server/user.',
            '/undo': 'Undo ur last added penalty.',
            '/create': 'Create a new penalty.',
            '/list': 'List penalties of the server.',
            '/remove': 'Remove a penalty from the server.',
            '/help': ':^)'
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Available Commands')
            .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
            .setDescription('Use them wisely and responsibly!')
            .addFields([
                { name: 'Command', value: Object.keys(commands).join('\n'), inline: true },
                { name: 'Description', value: Object.values(commands).join('\n').replaceAll(' ', '\xA0'), inline: true },
            ])

        await interaction.reply({ embeds: [embed] });
    });
