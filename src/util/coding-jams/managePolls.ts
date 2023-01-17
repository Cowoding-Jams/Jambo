import { ActionRowBuilder, CommandInteraction, EmbedBuilder, SelectMenuBuilder } from "discord.js";
import { DateTime } from "luxon";
import { pollSelectionTypes } from "../../commands/CodingJamsCommand";
import { Poll, pollDb, PollEvent, pollEventsDb, Proposal, proposalDb } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import { numberedList } from "../misc/format";
import { getFromEnmap } from "../misc/enmap";
import { discordRelativeTimestamp, discordTimestamp } from "../misc/time";

export async function newPoll(
	interaction: CommandInteraction,
	name: string,
	numProposals: number,
	numVotes: number,
	selectionType: string,
	start: DateTime,
	end: DateTime
) {
	if (pollDb.findKey((poll) => poll.title === name)) {
		interaction.reply({
			content: `A poll with the name "${name}" already exists...`,
			ephemeral: true,
		});
		return;
	}

	if (proposalDb.size < 2) {
		interaction.reply({
			content: "There simply aren't enough proposals to create a poll...",
			ephemeral: true,
		});
		return;
	}

	// check numVotes and numProposals
	if (numVotes > numProposals) numVotes = numProposals;
	if (proposalDb.size < numProposals) {
		numProposals = proposalDb.size;
		numVotes = proposalDb.size;
	}

	const sorted = sortBySelectionType(selectionType);

	const poll: Poll = {
		title: name,
		numProposals: numProposals,
		numVotes: numVotes,
		start: start,
		end: end,
		selectionType: selectionType,
		exclude: [],
		include: [],
		votingPrompt: null,
		proposals: sorted.slice(0, numProposals).map((e) => e.value),
		votes: new Map<string, string[]>(),
	};

	const id = pollDb.autonum;
	pollDb.set(id, poll);

	const events: PollEvent[] = [
		{ pollID: id, type: "before", promptID: null, date: start.minus({ days: 1 }) },
		{ pollID: id, type: "open", promptID: null, date: start },
	];

	events.forEach((e) => pollEventsDb.set(pollEventsDb.autonum, e));

	interaction.reply({
		embeds: [pollEmbed(poll, id, "(new)")],
		components: pollSelectMenus(poll, id, sorted, sorted),
		ephemeral: true,
	});
}

export async function editPoll(interaction: CommandInteraction, name: string, end: DateTime) {
	const pollKey = pollDb.findKey((poll) => poll.title === name);

	if (!pollKey) {
		interaction.reply({ content: `There is no jam with the name "${name}"`, ephemeral: true });
		return;
	}

	const poll = pollDb.get(pollKey)!;

	if (poll.end < DateTime.now()) {
		await interaction.reply({ content: `"${name}" has already ended, so extending it doesnt make much sense`, ephemeral: true });
		return;
	}

	pollDb.set(pollKey, { ...poll, end: end });

	const diff = poll.end.diff(end);
	const inFuture = poll.end < end;

	for (const key of pollEventsDb.keyArray()) {
		const poll = pollEventsDb.get(key)!;
		if (!(poll.pollID === pollKey && poll.type === "close")) continue;
		pollEventsDb.update(key, (event) => {
			const old = event.date;
			const newDate = inFuture ? old.plus(diff) : old.minus(diff);
			return { ...event, date: newDate };
		});
	}

	const sorted = sortBySelectionType(poll.selectionType);

	await interaction.reply({
		embeds: [pollEmbed(poll, pollKey, "(edit)")],
		components: pollSelectMenus(
			poll,
			pollKey,
			sorted.filter((e) => !poll.exclude.includes(e.value)),
			sorted.filter((e) => !poll.include.includes(e.value))
		),
		ephemeral: true,
	});
}

export async function viewPoll(interaction: CommandInteraction, name: string) {
	const pollKey = pollDb.findKey((poll) => poll.title === name);

	if (!pollKey) {
		await interaction.reply({ content: `There is no jam with the name "${name}"`, ephemeral: true });
		return;
	}

	const poll = pollDb.get(pollKey)!;

	await interaction.reply({ embeds: [pollEmbed(poll, pollKey, "(view)")], ephemeral: true });
}

export async function deletePoll(interaction: CommandInteraction, name: string) {
	const pollKey = pollDb.findKey((poll) => poll.title === name);

	if (!pollKey) {
		interaction.reply({ content: `There is no jam with the name "${name}"`, ephemeral: true });
		return;
	}

	pollDb.delete(pollKey);

	for (const key of pollEventsDb.keyArray()) {
		const poll = pollEventsDb.get(key)!;
		if (!(poll.pollID === pollKey)) continue;
		pollEventsDb.delete(key);
	}

	interaction.reply({ content: `${name} deleted!`, ephemeral: true });
}

export async function votesPoll(interaction: CommandInteraction, name: string) {
	const pollKey = pollDb.findKey((poll) => poll.title === name);

	if (!pollKey) {
		interaction.reply({ content: `There is no jam with the name "${name}"`, ephemeral: true });
		return;
	}
	const poll = pollDb.get(pollKey)!;

	if (poll.start > DateTime.now()) {
		await interaction.reply({ content: `There is no jam with the name "${name}"`, ephemeral: true });
		return;
	}

	const votesPerUser = Array.from(poll.votes.entries()).map((e) => ({ user: e[0], votes: e[1] }));
	const votesPerProposal: { key: string; votes: number }[] = [];
	const votesInTotal = votesPerUser.map((e) => e.votes).flat();

	poll.proposals.forEach((p) =>
		votesPerProposal.push({ key: p, votes: votesInTotal.filter((v) => v === p).length })
	);
	votesPerProposal.sort((a, b) => b.votes - a.votes);

	const proposals = getFromEnmap(
		proposalDb,
		votesPerProposal.map((p) => p.key)
	);
	const usersPerProposal = votesPerProposal.map((e) =>
		votesPerUser.filter((v) => v.votes.includes(e.key)).map((v) => v.user)
	);

	const list = numberedList(
		proposals.map((p) => p?.title || "Unknown"),
		votesPerProposal.map((p) => p.votes + " votes")
	);

	const embed = new EmbedBuilder().setTitle(`${poll.title} (votes)`).addFields(
		list.map((e, i) => ({
			name: e ?? "Unknown",
			value: usersPerProposal[i].map((u) => `<@${u}>`).join(" ") || "-",
		}))
	);

	await interaction.reply({ embeds: [addEmbedFooter(embed)], ephemeral: true });
}

export function sortBySelectionType(selectionType: string) {
	const sorting: {
		[key: string]: (a: { key: string; val: Proposal }, b: { key: string; val: Proposal }) => number;
	} = {
		[pollSelectionTypes.random]: () => (Math.random() > 0.5 ? 1 : -1),
		[pollSelectionTypes.newest]: (a, b) => (a.val.created >= b.val.created ? 1 : -1),
		[pollSelectionTypes.oldest]: (a, b) => (a.val.created <= b.val.created ? 1 : -1),
		[pollSelectionTypes.top]: (a, b) => b.val.votesLastPoll - a.val.votesLastPoll,
		[pollSelectionTypes.bottom]: (a, b) => a.val.votesLastPoll - b.val.votesLastPoll,
		[pollSelectionTypes.topAll]: (a, b) => b.val.totalVotes - a.val.totalVotes,
		[pollSelectionTypes.bottomAll]: (a, b) => a.val.totalVotes - b.val.totalVotes,
		[pollSelectionTypes.fewestPolls]: (a, b) => b.val.polls - a.val.polls,
		[pollSelectionTypes.mostPolls]: (a, b) => a.val.polls - b.val.polls,
	};

	return Array.from(proposalDb.entries())
		.map((e) => ({ key: e[0], val: e[1] }))
		.sort(sorting[selectionType])
		.map((e) => ({ label: e.val.title, value: e.key }));
}

export function pollEmbed(poll: Poll, pollKey: string, title: string) {
	const proposals = proposalDb
		.filter((v, k) => poll.proposals.includes(k))
		.map((v, k) => `- ${v.title} (id: ${k})`);

	return addEmbedFooter(
		new EmbedBuilder()
			.setTitle(`${poll.title} ${title}`)
			.setDescription(`Proposals: ${poll.numProposals} ⁘ Votes: ${poll.numVotes}`)
			.addFields(
				{
					name: "Start - End",
					value: `${discordTimestamp(poll.start)} - ${discordTimestamp(poll.end)}`,
				},
				{
					name: "Included proposals",
					value:
						proposalDb
							.filter((v, k) => poll.include.includes(k))
							.array()
							.map((v) => v.title)
							.join(", ") || "None",
				},
				{
					name: "Excluded proposals",
					value:
						proposalDb
							.filter((v, k) => poll.exclude.includes(k))
							.array()
							.map((v) => v.title)
							.join(", ") || "None",
				},
				{
					name: "Events",
					value:
						pollEventsDb
							.filter((e) => e.pollID == pollKey)
							.map((e) => `- ${e.type} ⁘ ${discordRelativeTimestamp(e.date)}`)
							.join("\n") || "None",
				},
				{ name: `Proposals (${poll.selectionType})`, value: proposals.join("\n") || "None" }
			)
	);
}

export function pollSelectMenus(
	poll: Poll,
	pollKey: string,
	includeOptions: { label: string; value: string }[],
	excludeOptions: { label: string; value: string }[]
) {
	const actionRows: ActionRowBuilder<SelectMenuBuilder>[] = [];

	actionRows.push(
		new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			new SelectMenuBuilder()
				.setCustomId(`poll.include.${pollKey}`)
				.setPlaceholder("Proposals to include")
				.setOptions({ label: "[reset]", value: "-" }, ...includeOptions.slice(0, 24))
				.setMinValues(0)
				.setMaxValues(Math.min(includeOptions.length + 1, 25))
		)
	);

	actionRows.push(
		new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			new SelectMenuBuilder()
				.setCustomId(`poll.exclude.${pollKey}`)
				.setPlaceholder("Proposals to exclude")
				.setOptions({ label: "[reset]", value: "-" }, ...excludeOptions.slice(0, 24))
				.setMinValues(0)
				.setMaxValues(Math.min(excludeOptions.length + 1, 25))
		)
	);

	return actionRows;
}
