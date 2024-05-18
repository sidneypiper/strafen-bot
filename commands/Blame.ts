import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import Command from '../core/Command';
import { logoUrl } from '../core/Helpers';
import database from '../database/data-source';
import { Penalty } from '../database/entity/Penalty';
import { filter } from 'fuzzaldrin-plus';
import { DataSource, Equal, ILike } from 'typeorm';
import { Infraction } from '../database/entity/Infraction';

const TIME_TO_DISPUTE = 60_000*1;
const TIME_TO_VOTE = 1_000*60*10;

async function persistPenalty(database: DataSource, guildId: string, userId: string, penalty: Penalty) {
    await database.getRepository(Infraction).insert({
        guild_id: guildId,
        user_id: userId,
        penalty: penalty
    });
}

export default new Command('blame')
    .setBuilder(builder => {
        return builder
            .setDescription('Blame a user for a penalty.')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The name of the user to blame.')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('penalty')
                    .setDescription('The name of the penalty.')
                    .setRequired(true)
                    .setAutocomplete(true))
    })
    .setAutocomplete(async interaction => {
        const penalties = await database.manager.find(Penalty, {
            select: ['name'],
            where: {
                guild_id: interaction.guild.id
            }
        });

        const input = interaction.options.getFocused(); 
        const possible = penalties.map(penalty => penalty.name);

        if(input === null || input.length === 0) return possible;

        return filter(possible, input);
    })
    .setHandler(async interaction => {
        // @ts-ignore
        const blamee = interaction.user;

        // @ts-ignore
        const blamed = interaction.options.getMember('user');

        // @ts-ignore
        const penalty = interaction.options.getString('penalty');

        database.getRepository(Penalty).findOneByOrFail({
            guild_id: Equal(interaction.guild.id),
            name: ILike(penalty.trim()),
        }).then(async (penalty) => {            
            const blamerMessage = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`You successfully blamed ${blamed.displayName} for ${penalty.name}`)
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
            
            await interaction.reply({ embeds: [blamerMessage], ephemeral: true });

            const dispute = new ButtonBuilder()
			    .setCustomId('dispute')
			    .setLabel('I didn\'t do that!!')
			    .setStyle(ButtonStyle.Danger);

		    const row = new ActionRowBuilder<ButtonBuilder>()
			    .addComponents(dispute);
            
            const publicBlameEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Arghhh ${blamed.displayName}! ${blamee.displayName} blamed you for ${penalty.name}`)
                .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                .setDescription('If you think this is wrong, click the button below to dispute the blame. You only have ' + Math.floor(TIME_TO_DISPUTE / 60_000.0) + ' minutes to do so though!')

            const publicBlame = await interaction.followUp({
                content: blamed.toString(),
                embeds: [publicBlameEmbed],
                components: [row]
            });

            const collectorFilterDispute = i => {
                return i.user.id === blamed.id && i.customId === 'dispute'
            };

            try {
                // Wait for the user to dispute the blame
	            await publicBlame.awaitMessageComponent({ filter: collectorFilterDispute, time: TIME_TO_DISPUTE });
                
                const disputeEmbedTie = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`You disputed the blame ${blamed.displayName}!`)
                    .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                    .setDescription(`You now have the chance to tell others why you shouldn't be penalized for ${penalty.name}.\n\nOutsiders can now vote for ${Math.floor(TIME_TO_VOTE / 60_000.00)} minutes on whether you are guilty or not.\n\nAs soon as one outsider votes, the voting will end and the result will be displayed.`);     
                
                const guiltyButton = new ButtonBuilder()
			        .setCustomId('guilty')
			        .setLabel('Guilty!')
			        .setStyle(ButtonStyle.Danger);

                const notGuiltyButton = new ButtonBuilder()
                    .setCustomId('not-guilty')
                    .setLabel('Not guilty!')
                    .setStyle(ButtonStyle.Success);

		        const row = new ActionRowBuilder<ButtonBuilder>()
			        .addComponents(notGuiltyButton, guiltyButton);
                
                console.log("Sending confirmation vote");
                const confirmationVote = await publicBlame.edit({
                    content: null,
                    embeds: [disputeEmbedTie],
                    components: [row]
                });
                
                // Only let outsiders vote on the matter
                const collectorFilterVote = i => {
                    return i.user.id !== blamed.id && i.user.id !== blamee.id;
                };

                try {
                    // Wait for someone to vote and store the result
                    const vote = await confirmationVote.awaitMessageComponent({
                        filter: collectorFilterVote,
                        time: TIME_TO_VOTE
                    });

                    if(vote.customId === 'guilty') {
                        const guiltyEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(`${vote.user.displayName} doomed you guilty!`)
                            .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                            .setDescription(`You are now officially blamed for ${penalty.name}.`);

                        await publicBlame.edit({
                            content: null,
                            embeds: [guiltyEmbed],
                            components: []
                        });

                        await persistPenalty(database, interaction.guild.id, blamed.id, penalty);
                        return;
                    } else if(vote.customId === 'not-guilty') {
                        const notGuiltyEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle(`${vote.user.displayName} saved you!`)
                            .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                            .setDescription(`You are not blamed for ${penalty.name}.`);
                            
                        await publicBlame.edit({
                            content: null,
                            embeds: [notGuiltyEmbed],
                            components: []
                        });

                        return;
                    }
                } catch (e) {
                    const notInTimeEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`Unfortunately, it seems you don't have any friends that voted for you!`)
                        .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                        .setDescription(`You are now officially blamed for ${penalty.name}.`);

	                await publicBlame.edit({
                        content: null,
                        embeds: [notInTimeEmbed],
                        components: []
                    });

                    await persistPenalty(database, interaction.guild.id, blamed.id, penalty);
                    return;
                }
            } catch (e) {
                const notInTimeEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Too late ${blamed.displayName}!`)
                    .setAuthor({ name: interaction.guild.name + ' Strafenbot', iconURL: logoUrl })
                    .setDescription(`You didn't dispute the blame in time. You are now officially blamed for ${penalty.name}.`);

	            await publicBlame.edit({
                    content: null,
                    embeds: [notInTimeEmbed],
                    components: []
                });
                
                await persistPenalty(database, interaction.guild.id, blamed.id, penalty);
                return;
            }
        }).catch(() => {
            interaction.reply({
                content: `:warning: The penalty with the name ${penalty} does not exist.`,
                ephemeral: true
            });
        });
    });
