import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { Proposal, proposalDb } from "../../db";
import { addEmbedColor, addEmbedFooter } from "../misc/embeds";
import { discordTimestamp, durationToReadable } from "../misc/time";
import { numberedList } from "../misc/format";

export async function listProposals(
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	page = 0,
	proposalsPerPage = 6
): Promise<void> {
	const pages = Math.ceil(proposalDb.size / proposalsPerPage);

	if (page < 0) page = pages - 1;
	else page = page % pages;

	const proposals = proposalDb.array().slice(page * proposalsPerPage, (page + 1) * proposalsPerPage);

	let embed = addEmbedFooter(new EmbedBuilder().setTitle(`${proposalDb.size} Proposals`));

	const list = numberedList(
		proposals.map((p) => p.title),
		proposals.map((p) => durationToReadable(p.duration)),
		page * proposalsPerPage
	);

	for (const [index, proposal] of proposals.entries()) {
		embed.addFields({
			name: list[index],
			value: `${proposal.description}${proposal.references != "" ? `\n${proposal.references}` : ""}`,
		});
	}

	if (proposalDb.size == 0) embed = addEmbedFooter(new EmbedBuilder().setTitle("No proposals in yet..."));
	else
		embed.setFooter({
			text: `Page ${page + 1}/${pages} ⁘ Proposals per page: ${proposalsPerPage}/10`,
		});

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId(`proposal.list.minus.${page}.${proposalsPerPage}`)
			.setLabel("-1")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(`proposal.list.left.${page}.${proposalsPerPage}`)
			.setLabel("◀")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`proposal.list.right.${page}.${proposalsPerPage}`)
			.setLabel("▶")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(`proposal.list.plus.${page}.${proposalsPerPage}`)
			.setLabel("+1")
			.setStyle(ButtonStyle.Secondary)
	);

	if (interaction instanceof ChatInputCommandInteraction)
		await interaction.reply({ embeds: [embed], components: proposalDb.size != 0 ? [row] : [] });
	else await interaction.update({ embeds: [embed], components: proposalDb.size != 0 ? [row] : [] });
}

export async function viewProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const title = interaction.options.getString("title") ?? "";
	const key = proposalDb.findKey((p) => p.title === title);

	if (!key) {
		await interaction.reply({
			content: "There is no proposal with that title... Follow the autocompletion!",
			ephemeral: true,
		});
		return;
	}

	const proposal = proposalDb.get(key)!;
	await interaction.reply({ embeds: [await viewProposalEmbed(proposal, "(view)")] });
}

export async function viewProposalEmbed(proposal: Proposal, titleAddition: string): Promise<EmbedBuilder> {
	return addEmbedColor(
		new EmbedBuilder()
			.setTitle(`${proposal.title} ⁘ ${proposal.abbreviation} ⁘ ${titleAddition}`)
			.setDescription(proposal.description)
			.addFields(
				{
					name: "References",
					value: proposal.references != "" ? proposal.references : "No references given.",
				},
				{
					name: "Duration",
					value: durationToReadable(proposal.duration),
					inline: true,
				},
				{
					name: "Votes Last Poll",
					value: proposal.polls == 0 ? "Wasn't part of a poll yet." : proposal.votesLastPoll.toString(),
					inline: true,
				},
				{
					name: "Proposed By/On",
					value: `<@${proposal.owner}> ⁘ ${discordTimestamp(proposal.created)}`,
				}
			)
	);
}
