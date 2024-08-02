import {
    AutocompleteInteraction,
    BaseInteraction,
    CommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js";

/**
 * Wrapper class for SlashCommandBuilder. Can be used like reglular SlashCommandBuilder,
 * but also takes a handler method that can be used to execute the command.
 * As you have to provide the name for the command, you don't have to call setName() method.
**/
export default class Command {
    name: string;
    handler: (interaction: CommandInteraction) => Promise<void> = async () => {};
    autocomplete: ((interaction: AutocompleteInteraction) => Promise<string[]>) = async () => [];
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder();
    
    constructor(name: string) {
        this.name = name;
    }
    
    setAutocomplete(autocomplete: (interaction: AutocompleteInteraction) => Promise<string[]>) {
        this.autocomplete = autocomplete;
        return this;
    }

    setHandler(handler: (interaction: CommandInteraction) => Promise<void>) { 
        this.handler = handler;
        return this;
    }
    
    setBuilder(build: (builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder)
               => SlashCommandBuilder | SlashCommandOptionsOnlyBuilder) {
        this.command = this.command.setName(this.name);
        this.command = build(this.command);
        return this;
    }

    payload()  {
        return this.command.toJSON();
    }

    async handle(interaction: BaseInteraction) {
        if(interaction.isAutocomplete()) {
            const choices = await this.autocomplete(interaction);

            await interaction.respond(choices.map(choice => ({name: choice, value: choice})));

            return;
        } 

        if (!interaction.isCommand()) return;
        if (interaction.commandName !== this.name) return;

        try{
            await this.handler(interaction);
        } catch (error) {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
}
