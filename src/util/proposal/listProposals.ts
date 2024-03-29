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
	if (interaction instanceof ChatInputCommandInteraction) await interaction.deferReply();
	else await interaction.deferUpdate();

	const pages = Math.ceil(proposalDb.size / proposalsPerPage);

	if (page < 0) page = pages - 1;
	else page = page % pages;

	const proposals = proposalDb.array();

	const list = numberedList(
		proposals.map((p) => `${p.title} (${p.abbreviation})`),
		proposals.map((p) => durationToReadable(p.duration))
	).slice(page * proposalsPerPage, (page + 1) * proposalsPerPage);

	let embed: EmbedBuilder;
	if (proposalDb.size == 0) {
		embed = addEmbedColor(new EmbedBuilder().setTitle("No proposals in yet..."));
	} else {
		embed = addEmbedFooter(new EmbedBuilder().setTitle(`${proposalDb.size} Proposals`)).setFooter({
			text: `Page ${page + 1}/${pages} ⁘ Proposals per page: ${proposalsPerPage}/10`,
		});

		for (const [index, proposal] of proposals
			.slice(page * proposalsPerPage, (page + 1) * proposalsPerPage)
			.entries()) {
			embed.addFields({
				name: list[index],
				value: `${proposal.description}${proposal.references != "" ? `\n${proposal.references}` : ""}`,
			});
		}
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

	await interaction.editReply({ embeds: [embed], components: proposalDb.size != 0 ? [row] : [] });
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
	const embed = addEmbedColor(
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
				}
			)
	);

	if (titleAddition !== "(new)" && titleAddition !== "(edit)") {
		embed.addFields({
			name: "Votes Last Poll",
			value: proposal.polls == 0 ? "Wasn't part of a poll yet." : proposal.votesLastPoll.toString(),
			inline: true,
		});
	}

	embed.addFields({
		name: "Proposed By/On",
		value: `<@${proposal.owner}> ⁘ ${discordTimestamp(proposal.created)}`,
	});

	return embed;
}
