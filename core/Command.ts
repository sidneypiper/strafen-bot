import {
    CommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

/**
 * Wrapper class for SlashCommandBuilder. Can be used like reglular SlashCommandBuilder,
 * but also takes a handler method that can be used to execute the command.
 * As you have to provide the name for the command, you don't have to call setName() method.
**/
export default class Command extends SlashCommandBuilder {
    name: string;
    handler: (interaction: CommandInteraction) => Promise<void> = async () => {};

    constructor(name: string) {
        super();
        this.name = name;
        super.setName(name);
    }

    setHandler(handler: (interaction: CommandInteraction) => Promise<void>) { 
        this.handler = handler;
        return this;
    }
        
    payload()  {
        return this.toJSON();
    }

    async handle(interaction: CommandInteraction) {
        if (!interaction.isCommand()) return;
        if (interaction.commandName !== this.name) return;

        try{
            this.handler(interaction);  
        } catch (error) {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
}
