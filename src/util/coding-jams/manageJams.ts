import { CommandInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { Jam, jamDb, JamEvent, jamEventsDb, proposalDb } from "../../db.js";
import { addEmbedFooter } from "../misc/embeds.js";
import { discordRelativeTimestamp, discordTimestamp, durationToReadable, isInFuture } from "../misc/time.js";
import { config } from "../../config.js";

const hoursBeforeEvent = 2;

export async function newJam(
	interaction: CommandInteraction,
	name: string,
	proposalName: string,
	start: DateTime
) {
	await interaction.deferReply({ ephemeral: true });

	if (jamDb.findKey((jam) => jam.title === name)) {
		interaction.editReply({ content: `A jam with the name "${name}" already exists...` });
		return;
	}

	const proposalID = proposalDb.findKey((p) => p.title === proposalName);
	if (!proposalID) {
		interaction.editReply({
			content: `Couldn't find a proposal with the name "${proposalName}". Follow the autocomplete!`,
		});
		return;
	}

	const proposal = proposalDb.get(proposalID)!;

	const end = start.plus(proposal.duration);

	proposalDb.set(proposalID, proposal);

	const jam: Jam = {
		title: name,
		proposal: proposalID,
		resultChannelID: null,
		start: start,
		end: end,
		scheduledEventID: null,
	};

	const id = String(jamDb.autonum);
	jamDb.set(id, jam);

	const events: JamEvent[] = [
		{ type: "start", jamID: id, date: jam.start },
		{ type: "end", jamID: id, date: jam.end },
		{ type: "createScheduledEvent", jamID: id, date: start.minus({ days: 4 }) },
		{
			type: "halftime",
			jamID: id,
			date: start.plus({ milliseconds: Math.floor(end.diff(start).toMillis() / 2) }),
		},
		{ type: "close-to-end", jamID: id, date: end.minus({ hours: hoursBeforeEvent }) },
		{ type: "close-to-start", jamID: id, date: start.minus({ hours: hoursBeforeEvent }) },
	];

	events.forEach((e) => jamEventsDb.set(String(jamEventsDb.autonum), e));

	interaction.editReply({ embeds: [jamEmbed(jam, id, "(new)")] });
}

export async function editJam(interaction: CommandInteraction, jam: Jam, jamKey: string, end: DateTime) {
	if (jam.end < DateTime.now()) {
		await interaction.reply({
			content: `The ${jam.title} has already ended. Extending it doesn't make much sense...`,
			ephemeral: true,
		});
		return;
	}

	jam.end = end;
	jamDb.set(jamKey, jam);

	for (const key of jamEventsDb
		.filter((event) => event.jamID === jamKey && ["halftime", "end", "close-to-end"].includes(event.type))
		.keyArray()) {
		jamEventsDb.delete(key);
	}

	const events: JamEvent[] = [
		{ type: "close-to-end", jamID: jamKey, date: end.minus({ hours: hoursBeforeEvent }) },
		{ type: "end", jamID: jamKey, date: jam.end },
	];

	const halftime = jam.start.plus({ milliseconds: Math.floor(end.diff(jam.start).toMillis() / 2) });
	if (isInFuture(halftime)) {
		events.push({
			type: "halftime",
			jamID: jamKey,
			date: halftime,
		});
	}

	events.forEach((e) => jamEventsDb.set(String(jamEventsDb.autonum), e));

	if (jam.scheduledEventID)
		interaction.guild?.scheduledEvents.edit(jam.scheduledEventID, { scheduledEndTime: end.toISO()! });

	if (jam.start < DateTime.now()) {
		const proposal = proposalDb.get(jam.proposal)!;

		const embed = new EmbedBuilder()
			.setTitle(`More time to finish!`)
			.setDescription(
				`The ${proposal.title} jam has been extended to the ${discordTimestamp(jam.end)}. That's ${discordRelativeTimestamp(jam.end)}! Happy jamming :)`
			);

		const channel = (await interaction.client.channels.fetch(config.jamChannelId)) as TextChannel;
		const jamRole =
			channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
		await channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
	}

	interaction.reply({ embeds: [jamEmbed(jam, jamKey, "(edit)")], ephemeral: true });
}

export async function viewJam(interaction: CommandInteraction, jam: Jam, jamKey: string) {
	await interaction.reply({ embeds: [jamEmbed(jam, jamKey, "(view)")], ephemeral: true });
}

export async function deleteJam(interaction: CommandInteraction, jam: Jam, jamKey: string) {
	jamDb.delete(jamKey);

	const proposal = proposalDb.get(jam.proposal)!;
	proposalDb.set(jam.proposal, proposal);

	if (jam.scheduledEventID) interaction.guild?.scheduledEvents.delete(jam.scheduledEventID);

	for (const key of jamEventsDb.filter((e) => e.jamID === jamKey).keyArray()) {
		jamEventsDb.delete(key);
	}

	interaction.reply({ content: `${jam.title} deleted!`, ephemeral: true });
}

function jamEmbed(jam: Jam, jamKey: string, title: string) {
	const proposal = proposalDb.get(jam.proposal);
	return addEmbedFooter(new EmbedBuilder().setTitle(`${jam.title} ${title}`)).addFields(
		{
			name: `Start - End (${durationToReadable(jam.end.diff(jam.start), true)})`,
			value: `${discordTimestamp(jam.start)} - ${discordTimestamp(jam.end)}`,
		},
		{
			name: "Proposal",
			value: proposal ? `${proposal?.title} ⁘ ${proposal?.abbreviation}` : "Unknown...",
		},
		{
			name: "Events",
			value: jamEventsDb
				.filter((e) => e.jamID == jamKey)
				.map((e) => `- ${e.type} ⁘ ${discordRelativeTimestamp(e.date)}`)
				.join("\n"),
			inline: true,
		}
	);
}
