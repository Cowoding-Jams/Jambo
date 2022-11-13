import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from "discord.js";
import { proposalDb } from "../../db";
import { addEmbedColor } from "../misc/embeds";

export async function listProposals(
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	page = 0,
	proposalsPerPage = 2 // up to 10 embeds per message
): Promise<void> {
	const pages = Math.ceil(proposalDb.size / proposalsPerPage);

	if (page < 0) page = pages - 1;
	else page = page % pages;

	const proposals = proposalDb
		.array()
		.map((p) => p)
		.slice(page * proposalsPerPage, (page + 1) * proposalsPerPage);

	let embeds: EmbedBuilder[] = [];

	for (const p of proposals) {
		embeds.push(
			addEmbedColor(new EmbedBuilder().setTitle(p.title).setDescription(p.description)).addFields(
				{
					name: "References",
					value: p.references ? p.references : "-",
				},
				{ name: "Proposed Time Period", value: p.timePeriod, inline: true },
				{
					name: "Proposed By",
					value: (await interaction.guild?.members.fetch(p.owner))?.toString() || "Unknown",
					inline: true,
				}
			)
		);
	}

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

	if (proposalDb.size == 0) embeds = [addEmbedColor(new EmbedBuilder().setTitle("No proposals in yet..."))];
	else
		embeds[embeds.length - 1].setFooter({
			text: `Page ${page + 1}/${pages} - Proposals per page: ${proposalsPerPage}/10`,
		});

	if (interaction instanceof ChatInputCommandInteraction)
		await interaction.reply({ embeds: embeds, components: proposalDb.size != 0 ? [row] : [] });
	else await interaction.update({ embeds: embeds, components: proposalDb.size != 0 ? [row] : [] });
}
