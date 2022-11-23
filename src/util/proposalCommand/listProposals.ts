import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	ModalSubmitInteraction,
} from "discord.js";
import { Proposal, proposalDb } from "../../db";
import { addEmbedColor } from "../misc/embeds";

export async function listProposals(
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	page = 0,
	proposalsPerPage = 6
): Promise<void> {
	const pages = Math.ceil(proposalDb.size / proposalsPerPage);

	if (page < 0) page = pages - 1;
	else page = page % pages;

	const proposals = proposalDb
		.array()
		.map((p, i) => ({ p: p, i: i }))
		.slice(page * proposalsPerPage, (page + 1) * proposalsPerPage);

	let embed = addEmbedColor(new EmbedBuilder().setTitle("Proposals"));

	for (const prop of proposals) {
		embed.addFields({
			name: `#${prop.i.toString().padStart(Math.ceil(proposalDb.size / 10), "0")} ${prop.p.title} ⁘ ${
				prop.p.timePeriod
			}`,
			value: `${prop.p.description}${prop.p.references != "" ? `\n${prop.p.references}` : ""}`,
		});
	}

	if (proposalDb.size == 0) embed = addEmbedColor(new EmbedBuilder().setTitle("No proposals in yet..."));
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
	const proposal = proposalDb.get(title);

	if (!proposal) {
		await interaction.reply({
			content: "There is no proposal with that title... Follow the autocompletion!",
			ephemeral: true,
		});
		return;
	}

	await interaction.reply({ embeds: [await viewProposalEmbed(interaction, proposal, "(view)")] });
}

export async function viewProposalEmbed(
	interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
	proposal: Proposal,
	titleAddition: string
): Promise<EmbedBuilder> {
	return addEmbedColor(
		new EmbedBuilder()
			.setTitle(`${proposal.title} ⁘ ${titleAddition}`)
			.setDescription(proposal.description)
			.addFields(
				{ name: "References", value: proposal.description ? proposal.description : "-" },
				{ name: "Proposed Time Period", value: proposal.timePeriod },
				{
					name: "Proposed By",
					value: proposal
						? (await interaction.guild?.members.fetch(proposal.ownerID))?.toString() || "Unknown"
						: interaction.user.toString(),
				},
				{
					name: "Votes last poll",
					value: proposal.votesLastPoll?.toString() || "Wasn't part of a poll yet.",
					inline: true,
				}
			)
	);
}
