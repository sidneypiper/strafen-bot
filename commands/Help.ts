import Command from '../core/Command';

export default new Command('help')
    .setBuilder(builder =>
        builder.setDescription('Show available commands.')
    )
    .setHandler(async interaction => {
        await interaction.reply([
            '**Available commands**',
            '`/add` — Blame a user for a penalty.',
            '`/cash` — Show the leaderboard or a user\'s stats.',
            '`/undo` — Undo your last blame.',
            '`/create` — Create a new penalty.',
            '`/list` — List all penalties.',
            '`/remove` — Remove a penalty.',
            '`/help` — :^)',
        ].join('\n'));
    });
