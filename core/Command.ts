import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/**
 * Wrapper class for SlashCommandBuilder. Can be used like regular SlashCommandBuilder,
 * but also takes a handler method that can be used to execute the command.
 * As you have to provide the name for the command, you don't have to call setName() method.
 **/
export default class Command {
    name: string
    command: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder

    constructor(name: string) {
        this.name = name;
    }

    handler: (interaction: ChatInputCommandInteraction) => Promise<void> = async () => {
    };

    autocomplete: ((interaction: AutocompleteInteraction) => Promise<string[]>) = async () => [];

    setAutocomplete(autocomplete: (interaction: AutocompleteInteraction) => Promise<string[]>) {
        this.autocomplete = autocomplete;
        return this;
    }

    setHandler(handler: (interaction: ChatInputCommandInteraction) => Promise<void>) {
        this.handler = handler;
        return this;
    }

    setBuilder(build: (builder: SlashCommandBuilder)
        => SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder) {
        const command = (new SlashCommandBuilder()).setName(this.name)
        this.command = build(command);
        return this;
    }

    payload() {
        return this.command.toJSON();
    }

    async handle(interaction: ChatInputCommandInteraction | AutocompleteInteraction) {
        if (interaction.isAutocomplete()) {
            const choices = await this.autocomplete(interaction);

            await interaction.respond(choices.map(choice => ({name: choice, value: choice})));

            return;
        }

        if (!interaction.isCommand()) return;
        if (interaction.commandName !== this.name) return;

        try {
            await this.handler(interaction);
        } catch (error) {
            console.error('Error while executing command', error);
            try {
                await interaction.reply({
                    content: ':warning: There was an error while executing this command!',
                    ephemeral: true
                });
            } catch (error) {
                if (error.code === "InteractionAlreadyReplied") {
                    await interaction.editReply({
                        content: ':warning: There was an error while executing this command!',
                    });
                } else {
                    console.error('Error while replying to interaction', error)
                }
            }
        }
    }
}
