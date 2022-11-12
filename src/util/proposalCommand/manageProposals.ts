import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	GuildMember,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { config } from "../../config";
import { proposalDb } from "../../db";
import { hasRole } from "../misc/permissions";

const title = new TextInputBuilder()
	.setCustomId("title")
	.setLabel("Title (Must be unique)")
	.setPlaceholder("Enter a catchy short title for your proposal!")
	.setStyle(TextInputStyle.Short)
	.setMinLength(2)
	.setMaxLength(60);

const description = new TextInputBuilder()
	.setCustomId("description")
	.setLabel("Description")
	.setPlaceholder("Add a suiting description!")
	.setStyle(TextInputStyle.Paragraph)
	.setMinLength(20)
	.setMaxLength(400);

const timePeriod = new TextInputBuilder()
	.setCustomId("time-period")
	.setLabel("Time Period")
	.setPlaceholder("Enter a time period for your proposal!")
	.setStyle(TextInputStyle.Short)
	.setMinLength(2)
	.setMaxLength(30);

const references = new TextInputBuilder()
	.setCustomId("references")
	.setLabel("References")
	.setPlaceholder("Add any references you may have like links to youtube videos or wikipedia articles!")
	.setStyle(TextInputStyle.Paragraph)
	.setMaxLength(400)
	.setRequired(false);

export async function addProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const modal = new ModalBuilder().setCustomId("proposal.add").setTitle("Add a new proposal!");

	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(title),
		new ActionRowBuilder<TextInputBuilder>().addComponents(description),
		new ActionRowBuilder<TextInputBuilder>().addComponents(timePeriod),
		new ActionRowBuilder<TextInputBuilder>().addComponents(references)
	);

	await interaction.showModal(modal);
}

export async function deleteProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const titleString = interaction.options.getString("title") || "";
	const proposal = proposalDb.get(titleString);

	if (!proposal) {
		await interaction.reply({ content: "There is no proposal with that title...", ephemeral: true });
		return;
	}

	if (
		proposal.owner !== interaction.user.id &&
		!(await hasRole(interaction.member as GuildMember, config.moderatorRoleId))
	) {
		await interaction.reply({ content: "You can only delete your own proposals...", ephemeral: true });
		return;
	}

	proposalDb.delete(titleString);
	await interaction.reply({ content: "Proposal deleted!", ephemeral: true });
}

export async function editProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const titleString = interaction.options.getString("title") || "";

	const proposal = proposalDb.get(titleString);

	if (!proposal) {
		await interaction.reply({ content: "There is no proposal with that title...", ephemeral: true });
		return;
	}

	if (
		proposal.owner !== interaction.user.id &&
		(await hasRole(interaction.member as GuildMember, config.moderatorRoleId))
	) {
		await interaction.reply({ content: "You can only edit your own proposals...", ephemeral: true });
		return;
	}

	const modal = new ModalBuilder().setCustomId("proposal.edit").setTitle("Edit a proposal!");

	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(title.setValue(proposal.title)),
		new ActionRowBuilder<TextInputBuilder>().addComponents(description.setValue(proposal.description)),
		new ActionRowBuilder<TextInputBuilder>().addComponents(timePeriod.setValue(proposal.timePeriod)),
		new ActionRowBuilder<TextInputBuilder>().addComponents(references.setValue(proposal.references))
	);

	await interaction.showModal(modal);
}
