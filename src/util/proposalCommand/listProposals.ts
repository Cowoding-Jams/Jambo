import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	ButtonInteraction,
} from "discord.js";
import { proposalDb } from "../../db";
import { addEmbedColor } from "../misc/embeds";

export async function listProposals(
	interaction: ChatInputCommandInteraction | ButtonInteraction,
	page: number = 0
): Promise<void> {
	const proposalsPerPage = 5;
	const pages = Math.ceil(proposalDb.size / proposalsPerPage);

	if (page < 0) page = pages - 1;
	else page = page % pages;

	const proposals = proposalDb
		.array()
		.map((p) => p)
		.slice(page * proposalsPerPage, (page + 1) * proposalsPerPage);

	let embed = addEmbedColor(
		new EmbedBuilder().setTitle("Proposals").setFooter({ text: `Page ${page + 1}/${pages}` })
	);

	for (const p of proposals) {
		embed.addFields({
			name: p.title,
			value: `${p.description}${p.references != "" ? `\nReferences:\n${p.references}` : ""}\nProposed By: ${
				(await interaction.guild?.members.fetch(p.owner))?.toString() || "Unknown"
			} - Proposed Time Period: ${p.timePeriod}`,
		});
	}

	const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder().setCustomId(`proposal.list.left.${page}`).setLabel("◀").setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId(`proposal.list.right.${page}`).setLabel("▶").setStyle(ButtonStyle.Primary)
	);

	if (proposalDb.size == 0) embed = addEmbedColor(new EmbedBuilder().setTitle("No proposals in yet..."));

	if (interaction instanceof ChatInputCommandInteraction)
		await interaction.reply({ embeds: [embed], components: proposalDb.size != 0 ? [row] : [] });
	else await interaction.update({ embeds: [embed], components: proposalDb.size != 0 ? [row] : [] });
}
