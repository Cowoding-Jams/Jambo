import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { pollDb, proposalDb } from "../../db";
import { hasAdminRole } from "../misc/permissions";

const title = new TextInputBuilder()
	.setCustomId("title")
	.setLabel("Title (Must be unique)")
	.setPlaceholder("Enter a catchy title for your proposal!")
	.setStyle(TextInputStyle.Short)
	.setMinLength(2)
	.setMaxLength(60);

const abbreviation = new TextInputBuilder()
	.setCustomId("abbreviation")
	.setLabel("Shorter title/abbreviation")
	.setPlaceholder("(e.g. 'aoc22' instead of 'Advent of Code 2022')")
	.setStyle(TextInputStyle.Short)
	.setMinLength(2)
	.setMaxLength(12);

const description = new TextInputBuilder()
	.setCustomId("description")
	.setLabel("Description")
	.setPlaceholder("Add a suiting description!")
	.setStyle(TextInputStyle.Paragraph)
	.setMinLength(20)
	.setMaxLength(200);

const duration = new TextInputBuilder()
	.setCustomId("duration")
	.setLabel("Duration in the ISO Duration format")
	.setPlaceholder("(e.g. 'P2DT12H' which corresponds to 2 days and 12 hours)")
	.setStyle(TextInputStyle.Short)
	.setMinLength(2)
	.setMaxLength(20);

const references = new TextInputBuilder()
	.setCustomId("references")
	.setLabel("References")
	.setPlaceholder(
		"Add any references you may have like links to videos! (please make it a pretty bullet list)"
	)
	.setStyle(TextInputStyle.Paragraph)
	.setMaxLength(200)
	.setRequired(false);

export async function addProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const modal = new ModalBuilder().setCustomId("proposal.add").setTitle("Add a new proposal!");

	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(title.setValue("")),
		new ActionRowBuilder<TextInputBuilder>().addComponents(abbreviation.setValue("")),
		new ActionRowBuilder<TextInputBuilder>().addComponents(description.setValue("")),
		new ActionRowBuilder<TextInputBuilder>().addComponents(duration.setValue("")),
		new ActionRowBuilder<TextInputBuilder>().addComponents(references.setValue(""))
	);

	await interaction.showModal(modal);
}

export async function deleteProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const titleString = interaction.options.getString("title") || "";
	const key = proposalDb.findKey((p) => p.title === titleString);

	if (!key) {
		await interaction.reply({ content: "There is no proposal with that title...", ephemeral: true });
		return;
	}

	const proposal = proposalDb.get(key)!;
	if (proposal.owner !== interaction.user.id && !(await hasAdminRole(interaction))) {
		await interaction.reply({ content: "You can only delete your own proposals...", ephemeral: true });
		return;
	}

	if (pollDb.array().some((p) => p.proposals.includes(key))) {
		await interaction.reply({
			content: "You can't delete a proposal that was or is part of a poll!",
			ephemeral: true,
		});
		return;
	}

	proposalDb.delete(key);
	await interaction.reply({ content: "Proposal deleted!", ephemeral: true });
}

export async function editProposal(interaction: ChatInputCommandInteraction): Promise<void> {
	const titleString = interaction.options.getString("title") || "";
	const key = proposalDb.findKey((p) => p.title === titleString);

	if (!key) {
		await interaction.reply({ content: "There is no proposal with that title...", ephemeral: true });
		return;
	}

	const proposal = proposalDb.get(key)!;
	if (proposal.owner !== interaction.user.id && !(await hasAdminRole(interaction))) {
		await interaction.reply({ content: "You can only edit your own proposals...", ephemeral: true });
		return;
	}

	const modal = new ModalBuilder().setCustomId(`proposal.edit.${key}`).setTitle("Edit a proposal!");

	modal.addComponents(
		new ActionRowBuilder<TextInputBuilder>().addComponents(title.setValue(proposal.title)),
		new ActionRowBuilder<TextInputBuilder>().addComponents(abbreviation.setValue(proposal.abbreviation)),
		new ActionRowBuilder<TextInputBuilder>().addComponents(description.setValue(proposal.description)),
		new ActionRowBuilder<TextInputBuilder>().addComponents(duration.setValue(proposal.duration.toISO())),
		new ActionRowBuilder<TextInputBuilder>().addComponents(references.setValue(proposal.references))
	);

	await interaction.showModal(modal);
}
