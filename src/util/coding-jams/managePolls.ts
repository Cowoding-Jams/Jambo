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
		interaction.reply({ content: "There is no poll with that name...", ephemeral: true });
		return;
	}
	const poll = pollDb.get(pollKey)!;

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

	await interaction.reply({
		embeds: [pollEmbed(poll, pollKey, "(edit)")],
		components: pollSelectMenus(
			poll,
			pollKey,
			sortBySelectionType(poll.selectionType).filter((e) => !poll.exclude.includes(e.value)),
			sortBySelectionType(poll.selectionType).filter((e) => !poll.include.includes(e.value))
		),
		ephemeral: true,
	});
}

export async function viewPoll(interaction: CommandInteraction, name: string) {
	const pollKey = pollDb.findKey((poll) => poll.title === name);

	if (!pollKey) {
		interaction.reply({ content: "There is no poll with that name...", ephemeral: true });
		return;
	}

	const poll = pollDb.get(pollKey)!;

	await interaction.reply({ embeds: [pollEmbed(poll, pollKey, "(view)")], ephemeral: true });
}

export async function deletePoll(interaction: CommandInteraction, name: string) {
	const pollKey = pollDb.findKey((poll) => poll.title === name);

	if (!pollKey) {
		interaction.reply({ content: "There is no poll with that name...", ephemeral: true });
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
		interaction.reply({ content: "There is no poll with that name...", ephemeral: true });
		return;
	}
	const poll = pollDb.get(pollKey)!;

	const votesPerUser = Array.from(poll.votes.values());
	const votesPerProposal: { key: string; votes: number }[] = [];
	const votesInTotal = votesPerUser.flat();

	poll.proposals.forEach((p) =>
		votesPerProposal.push({ key: p, votes: votesInTotal.filter((v) => v === p).length })
	);
	votesPerProposal.sort((a, b) => b.votes - a.votes);

	const proposals = getFromEnmap(
		proposalDb,
		votesPerProposal.map((p) => p.key)
	);
	const usersPerProposal = votesPerProposal.map((e) =>
		votesPerUser.filter((v) => v[1].includes(e.key)).map((v) => v[0])
	);

	const list = numberedList(
		proposals.map((p) => p?.title || "Unknown"),
		votesPerProposal.map((p) => p.votes + " votes")
	);

	const embed = new EmbedBuilder().setTitle(`${poll.title} (votes)`).setFields(
		...list.map((e, i) => ({
			name: e,
			value: usersPerProposal[i].map((u) => `<@${u}>`).join(" "),
			inline: true,
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
	};

	return Array.from(proposalDb.entries())
		.map((e) => ({ key: e[0], val: e[1] }))
		.sort(sorting[selectionType])
		.map((e) => ({ label: e.val.title, value: e.key }));
}

export function pollEmbed(poll: Poll, pollKey: string, title: string) {
	const proposals = proposalDb
		.filter((v, k) => poll.proposals.includes(k))
		.map((v, k) => `- ${v.title} (${k})`);

	return addEmbedFooter(
		new EmbedBuilder()
			.setTitle(`${poll.title} ${title}`)
			.setDescription(`Proposals: ${poll.numProposals} - Votes: ${poll.numVotes}`)
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
							.join(", ") || "-",
				},
				{
					name: "Excluded proposals",
					value:
						proposalDb
							.filter((v, k) => poll.exclude.includes(k))
							.array()
							.map((v) => v.title)
							.join(", ") || "-",
				},
				{
					name: "Events",
					value: pollEventsDb
						.filter((e) => e.pollID == pollKey)
						.map((e) => `- ${e.type} ⁘ ${discordRelativeTimestamp(e.date)}`)
						.join("\n"),
				},
				{ name: "Proposals", value: proposals.join("\n") }
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
				.setOptions(includeOptions.slice(0, 25))
				.setMaxValues(25)
		)
	);

	actionRows.push(
		new ActionRowBuilder<SelectMenuBuilder>().addComponents(
			new SelectMenuBuilder()
				.setCustomId(`poll.exclude.${pollKey}`)
				.setPlaceholder("Proposals to exclude")
				.setOptions(excludeOptions.slice(0, 25))
				.setMaxValues(25)
		)
	);

	return actionRows;
}
