import Command from '../core/Command';

export default new Command('ping')
    .setDescription('Provides information about the user.')
    .setHandler(async interaction => {
        await interaction.reply(`Pong to ${interaction.user.username}.`);
    });
