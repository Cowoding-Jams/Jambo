import { CommandInteraction, EmbedBuilder } from "discord.js";
import { DateTime } from "luxon";
import { Jam, jamDb, JamEvent, jamEventsDb, proposalDb } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import { discordRelativeTimestamp, discordTimestamp, durationToReadable } from "../misc/time";

export async function newJam(
	interaction: CommandInteraction,
	name: string,
	proposalName: string,
	start: DateTime
) {
	if (jamDb.findKey((jam) => jam.title === name)) {
		interaction.reply({ content: `A jam with the name "${name}" already exists...`, ephemeral: true });
		return;
	}

	const proposalID = proposalDb.findKey((p) => p.title === proposalName);
	if (!proposalID) {
		interaction.reply({
			content: `Couldn't find a proposal with the name "${proposalName}". Follow the autocomplete!`,
		});
		return;
	}

	const proposal = proposalDb.get(proposalID)!;
	const end = start.plus(proposal.duration);

	const jam: Jam = {
		title: name,
		proposal: proposalID,
		resultChannelID: null,
		start: start,
		end: end,
		eventID: null,
	};

	const id = jamDb.autonum;
	jamDb.set(id, jam);

	const events: JamEvent[] = [
		{ type: "start", jamID: id, date: jam.start },
		{ type: "end", jamID: id, date: jam.end },
		{ type: "createScheduledEvent", jamID: id, date: start.minus({ days: 4 }) },
		{
			type: "halftime",
			jamID: id,
			date: start.plus({ milliseconds: Math.floor(start.diff(end).toMillis() / 2) }),
		},
		{ type: "close-to-end", jamID: id, date: end.minus({ hours: 2 }) },
		{ type: "close-to-start", jamID: id, date: start.minus({ hours: 2 }) },
	];

	events.forEach((e) => jamEventsDb.set(jamEventsDb.autonum, e));

	interaction.reply({ embeds: [jamEmbed(jam, id, "(new)")], ephemeral: true });
}

export async function editJam(interaction: CommandInteraction, name: string, end: DateTime) {
	const jamKey = jamDb.findKey((j) => j.title === name);
	if (!jamKey) {
		interaction.reply({ content: "There is no jam with that name...", ephemeral: true });
		return;
	}
	const jam = jamDb.get(jamKey)!;

	jamDb.set(jamKey, { ...jam, end: end });

	const diff = jam.end.diff(end);
	const inFuture = jam.end < end;

	for (const key of jamEventsDb.keyArray()) {
		const jam = jamEventsDb.get(key)!;
		if (!(jam.jamID === jamKey && jam.type in ["halftime", "end", "close-to-end"])) continue;
		jamEventsDb.update(key, (event) => {
			const old = event.date;
			const newDate = inFuture ? old.plus(diff) : old.minus(diff);
			return { ...event, date: newDate };
		});
	}

	if (jam.eventID) {
		interaction.guild?.scheduledEvents.edit(jam.eventID, { scheduledEndTime: end.toISO() });
	}

	interaction.reply({ embeds: [jamEmbed(jam, jamKey, "(edit)")], ephemeral: true });
}

export async function viewJam(interaction: CommandInteraction, name: string) {
	const jamKey = jamDb.findKey((j) => j.title === name);
	if (!jamKey) {
		interaction.reply({ content: "There is no jam with that name...", ephemeral: true });
		return;
	}

	const jam = jamDb.get(jamKey)!;
	await interaction.reply({ embeds: [jamEmbed(jam, jamKey, "(view)")], ephemeral: true });
}

export async function deleteJam(interaction: CommandInteraction, name: string) {
	const jamKey = jamDb.findKey((j) => j.title === name);
	if (!jamKey) {
		interaction.reply({ content: "There is no jam with that name...", ephemeral: true });
		return;
	}

	const jam = jamDb.get(jamKey)!;

	jamDb.delete(jamKey);

	if (jam.eventID) {
		interaction.guild?.scheduledEvents.delete(jam.eventID);
	}

	for (const key of jamEventsDb.keyArray()) {
		const jam = jamEventsDb.get(key)!;
		if (!(jam.jamID === jamKey)) continue;
		jamEventsDb.delete(key);
	}

	interaction.reply({ content: `${name} deleted!`, ephemeral: true });
}

function jamEmbed(jam: Jam, jamKey: string, title: string) {
	return addEmbedFooter(new EmbedBuilder().setTitle(`${jam.title} ${title}`)).addFields(
		{
			name: "Start",
			value: discordTimestamp(jam.start),
			inline: true,
		},
		{
			name: "End",
			value: discordTimestamp(jam.end),
			inline: true,
		},
		{
			name: "Duration",
			value: durationToReadable(jam.start.diff(jam.end)),
			inline: true,
		},
		{
			name: "Proposal",
			value: proposalDb.get(jam.proposal)?.title || "Unknown...",
		},
		{
			name: "Events",
			value: jamEventsDb
				.filter((e) => e.jamID == jamKey)
				.map((e) => `- ${e.type} ⁘ ${discordRelativeTimestamp(e.date)}`)
				.join("\n"),
		}
	);
}
