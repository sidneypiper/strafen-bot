# Strafenbot V2

Server-independent version of the Strafenbot.

## Usage
To add the bot to your server, click [here](https://discord.com/oauth2/authorize?client_id=1239207429414195221&permissions=8&redirect_uri=https%3A%2F%2Fdiscord.com%2Foauth2%2Fauthorize&integration_type=0&scope=bot+applications.commands).

## Commands
- `/help` - Shows a list of all commands.
- `/add` - Adds a new penalty to a user.
- `/undo` - Undoes your last add.
- `/create` - Creates a new penalty type.
- `/list` - Lists all penalties on this server.
- `/remove` - Removes a penalty on this server.

## Development
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

## Contributing
> Thank you for considering to contribute to the Strafenbot! If you want to partake in this journey, please follow this rough outline.
- Fork repository
- Create new branch, preferably after consistent naming schema (`feature/xy`, `fix/xy`, ...)
- Make your changes and commit them using (Conventional commits)[https://www.conventionalcommits.org/en/v1.0.0/]
- Create a pull request with a descriptive title and tell us what you changed and why
