import { Command } from "../Command";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, TextChannel, Util } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { pollDb, ProposalData, proposalDb } from "db";
import { startPoll } from "poller";

class PollCommand extends Command {
	constructor() {
		super("poll");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.deferReply({
			ephemeral: true,
		});

		const sub = interaction.options.getSubcommand();
		switch (sub) {
			case "new": {
				const name = interaction.options.getString("name", true);
				const desc = interaction.options.getString("desc", true);
				if (name.length > 32) {
					await interaction.editReply("Proposal name must be 32 characters or less");
					return;
				}
				if (desc.length > 512) {
					await interaction.editReply("Proposal description must be 512 characters or less");
					return;
				}
				const existing = proposalDb.find(({ name: n }) => n === name);
				if (existing) {
					await interaction.editReply("Proposal already exists");
					return;
				}
				const id = proposalDb.autonum;
				proposalDb.set(id, {
					id,
					user: interaction.user.id,
					name,
					desc: desc,
				});
				await interaction.editReply(`Proposal for \`${Util.escapeInlineCode(name)}\` created.`);
				break;
			}

			case "delete": {
				await interaction.deferReply({
					ephemeral: true,
				});
				const name = interaction.options.getString("name", true);
				const existing = proposalDb.find(({ name: n }) => n === name);
				if (!existing) {
					await interaction.editReply("Proposal does not exist");
					return;
				}
				const member = await interaction.guild?.members.fetch(interaction.user.id);
				if (!member || (existing.user !== interaction.user.id && !member.permissions.has("ADMINISTRATOR"))) {
					await interaction.editReply("You do not have permission to delete this proposal");
					return;
				}
				proposalDb.delete(existing.id);
				await interaction.editReply(`Proposal for \`${Util.escapeInlineCode(name)}\` deleted.`);
				break;
			}

			case "start": {
				await interaction.deferReply({
					ephemeral: true,
				});
				const member = await interaction.guild?.members.fetch(interaction.user.id);
				if (!member || !member.permissions.has("ADMINISTRATOR")) {
					await interaction.editReply("You do not have permission to do this");
					return;
				}
				const name = interaction.options.getString("name", true);
				const time = interaction.options.getNumber("time", true);
				const optionCount = interaction.options.getNumber("options", false) ?? 20;
				const votes = interaction.options.getNumber("votes", false) ?? Math.round(optionCount * 0.6);

				const options: ProposalData[] = [];
				// TODO: will die if optioncount is larger than available proposals, unlikely to happen
				while (options.length < optionCount) {
					const p = proposalDb.random();
					if (options.findIndex((p2) => p2.id === p.id) === -1) options.push(p);
				}

				const embed = new MessageEmbed()
					.setTitle(name)
					// TODO: will die with too long description
					.setDescription(
						`Ends <t:${Math.floor(Date.now() / 1000) + time * 60 * 60}:R>\n\n` +
							options.map((p) => `\`${Util.escapeInlineCode(p.name)}\` by <@${p.user}>\n${p.desc}`).join("\n\n")
					);

				const id = pollDb.autonum;

				const btn = new MessageButton().setCustomId(`vote.${id}`).setLabel("Vote!");
				const row = new MessageActionRow().addComponents(btn);

				if (!(interaction.channel instanceof TextChannel)) throw new Error("Unreachable, frick types");
				const sent = await interaction.channel.send({ embeds: [embed], components: [row] });

				pollDb.set(id, {
					id,
					name,
					voteStart: Date.now(),
					voteEnd: Date.now() + time * 60 * 60 * 1000,
					numberOfVotes: votes,
					options: options.map((p) => ({
						id: p.id,
						name: p.name,
						votes: [],
					})),
					channelId: interaction.channelId,
					messageId: sent.id,
				});

				startPoll(id);

				await interaction.editReply(`Poll for \`${Util.escapeInlineCode(name)}\` created.`);
				break;
			}

			case "list": {
				await interaction.deferReply({
					ephemeral: true,
				});
				const member = await interaction.guild?.members.fetch(interaction.user.id);
				if (!member || !member.permissions.has("ADMINISTRATOR")) {
					await interaction.editReply("You do not have permission to do this");
					return;
				}
				const type = interaction.options.getString("type", true);
				switch (type) {
					case "proposals": {
						const proposals = proposalDb.array();
						if (proposals.length === 0) {
							await interaction.editReply("No proposals");
							return;
						}
						// TODO: will die with enough proposals, needs pagination
						const embed = new MessageEmbed().setTitle("Proposals").addFields(
							proposals.map(({ name, desc, user }) => ({
								name: `"${Util.escapeMarkdown(name)}" by <@${user}>`,
								value: desc,
							}))
						);
						await interaction.editReply({ embeds: [embed] });
						break;
					}

					case "polls": {
						const polls = pollDb.array();
						if (polls.length === 0) {
							await interaction.editReply("No polls");
							return;
						}
						// TODO: will die with enough polls, needs pagination
						const embed = new MessageEmbed().setTitle("Polls").addFields(
							polls.map((poll) => ({
								name: `"${Util.escapeMarkdown(poll.name)}"`,
								value:
									`Created on <t:${poll.voteStart}:F>` +
									`\n${
										poll.voteEnd < Date.now()
											? `Winner: \`${Util.escapeInlineCode(poll.winnerName ?? "unreachable")}\``
											: `Voting ends <t:${poll.voteEnd}:R>`
									}` +
									`\nTotal options: ${poll.options.length}` +
									`\nTotal votes: ${poll.options.reduce((a, c) => a + c.votes.length, 0)}` +
									`\nAvailable votes: ${poll.numberOfVotes}`,
							}))
						);
						await interaction.editReply({ embeds: [embed] });
						break;
					}
				}
			}
		}
	}

	register() {
		return new SlashCommandBuilder()
			.setName("poll")
			.setDescription("Everything polling related commands, manage proposals and polls")
			.addSubcommandGroup((group) => {
				group.setName("proposal");
				group.setDescription("Manage proposals");
				group.addSubcommand((sub) => {
					sub.setName("new");
					sub.addStringOption((opt) => {
						opt.setName("name");
						opt.setDescription("Short name");
						opt.setRequired(true);
						return opt;
					});
					sub.addStringOption((opt) => {
						opt.setName("desc");
						opt.setDescription("Longer description");
						opt.setRequired(true);
						return opt;
					});
					return sub;
				});
				group.addSubcommand((sub) => {
					sub.setName("delete");
					sub.setDescription("Delete a proposal");
					sub.addStringOption((opt) => {
						opt.setName("name");
						opt.setDescription("The name of the proposal");
						opt.setRequired(true);
						return opt;
					});
					return sub;
				});
				return group;
			})
			.addSubcommand((sub) => {
				sub.setName("start");
				sub.setDescription("Start a poll");
				sub.addStringOption((opt) => {
					opt.setName("name");
					opt.setDescription("The name of the poll");
					opt.setRequired(true);
					return opt;
				});
				sub.addNumberOption((opt) => {
					opt.setName("time");
					opt.setDescription("Time to vote in hours");
					opt.setRequired(true);
					return opt;
				});
				sub.addNumberOption((opt) => {
					opt.setName("votes");
					opt.setDescription("Number of votes. Defaults to 60% of options");
					opt.setRequired(false);
					return opt;
				});
				sub.addNumberOption((opt) => {
					opt.setName("options");
					opt.setDescription("Maximum number of options. Defaults to 20");
					opt.setRequired(false);
					return opt;
				});
				return sub;
			})
			.addSubcommand((sub) => {
				sub.setName("list");
				sub.setDescription("Admistrative list of different things");
				sub.addStringOption((opt) => {
					opt.setName("type");
					opt.setDescription("Type of things to list");
					opt.setRequired(true);
					opt.setChoices(["proposals", "polls"].map((v) => [v, v] as [string, string]));
					return opt;
				});
				return sub;
			});
	}
}

export default new PollCommand();
