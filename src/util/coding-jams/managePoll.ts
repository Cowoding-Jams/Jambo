import { ActionRowBuilder, CommandInteraction, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
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

	const unused = unusedProposals();

	if (unused.size < 2) {
		interaction.reply({
			content: "There simply aren't enough proposals to create a poll...",
			ephemeral: true,
		});
		return;
	}

	// check numVotes and numProposals
	if (numVotes > numProposals) numVotes = numProposals;
	if (unused.size < numProposals) {
		numProposals = unused.size;
		numVotes = unused.size;
	}

	const sorted = sortBySelectionType(unused, selectionType);
	const proposals = sorted.slice(0, numProposals);

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
		proposals: proposals.map((e) => e.key),
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
		components: pollSelectMenus(
			id,
			sorted.filter((v) => !proposals.includes(v)),
			sorted.filter((v) => proposals.includes(v))
		),
		ephemeral: true,
	});
}

export async function editPoll(interaction: CommandInteraction, poll: Poll, pollKey: string, end: DateTime) {
	if (poll.end < DateTime.now()) {
		await interaction.reply({
			content: `The ${poll.title} has already ended. Extending it doesn't make much sense...`,
			ephemeral: true,
		});
		return;
	}

	poll.end = end;
	pollDb.set(pollKey, poll);

	let messageID = null;
	for (const key of pollEventsDb
		.filter((event) => event.pollID === pollKey && event.type === "close")
		.keyArray()) {
		messageID = pollEventsDb.get(key)!.promptID;
		pollEventsDb.delete(key);
	}

	if (messageID) {
		pollEventsDb.set(pollEventsDb.autonum, {
			pollID: pollKey,
			type: "close",
			date: poll.end,
			promptID: messageID,
		});
	}

	const sorted = sortBySelectionType(unusedProposals(), poll.selectionType);

	await interaction.reply({
		embeds: [pollEmbed(poll, pollKey, "(edit)")],
		components: pollSelectMenus(
			pollKey,
			sorted.filter((e) => !poll.exclude.includes(e.key)).filter((v) => !poll.proposals.includes(v.key)),
			sorted.filter((e) => !poll.include.includes(e.key)).filter((v) => poll.proposals.includes(v.key))
		),
		ephemeral: true,
	});
}

export async function viewPoll(interaction: CommandInteraction, poll: Poll, pollKey: string) {
	await interaction.reply({ embeds: [pollEmbed(poll, pollKey, "(view)")], ephemeral: true });
}

export async function deletePoll(interaction: CommandInteraction, poll: Poll, pollKey: string) {
	pollDb.delete(pollKey);

	for (const key of pollEventsDb.filter((e) => e.pollID === pollKey).keyArray()) {
		pollEventsDb.delete(key);
	}

	interaction.reply({ content: `${poll.title} deleted!`, ephemeral: true });
}

export async function votesPoll(interaction: CommandInteraction, poll: Poll) {
	if (poll.start > DateTime.now()) {
		await interaction.reply({ content: `Voting hasn't started yet...`, ephemeral: true });
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

export function sortBySelectionType(proposals: typeof proposalDb, selectionType: string) {
	const sorting: {
		[key: string]: (a: { key: string; proposal: Proposal }, b: { key: string; proposal: Proposal }) => number;
	} = {
		[pollSelectionTypes.random]: () => (Math.random() > 0.5 ? 1 : -1),
		[pollSelectionTypes.newest]: (a, b) => (a.proposal.created >= b.proposal.created ? 1 : -1),
		[pollSelectionTypes.oldest]: (a, b) => (a.proposal.created <= b.proposal.created ? 1 : -1),
		[pollSelectionTypes.top]: (a, b) => b.proposal.votesLastPoll - a.proposal.votesLastPoll,
		[pollSelectionTypes.bottom]: (a, b) => a.proposal.votesLastPoll - b.proposal.votesLastPoll,
		[pollSelectionTypes.topAll]: (a, b) => b.proposal.totalVotes - a.proposal.totalVotes,
		[pollSelectionTypes.bottomAll]: (a, b) => a.proposal.totalVotes - b.proposal.totalVotes,
		[pollSelectionTypes.fewestPolls]: (a, b) => b.proposal.polls - a.proposal.polls,
		[pollSelectionTypes.mostPolls]: (a, b) => a.proposal.polls - b.proposal.polls,
	};

	return Array.from(proposals.entries())
		.map((e) => ({ key: e[0], proposal: e[1] }))
		.sort(sorting[selectionType]);
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
	pollKey: string,
	includeOptions: { key: string; proposal: Proposal }[],
	excludeOptions: { key: string; proposal: Proposal }[]
) {
	return [
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`poll.include.${pollKey}`)
				.setPlaceholder("Proposals to include")
				.setOptions(
					{ label: "[reset]", value: "-" },
					...includeOptions.slice(0, 24).map((e) => ({ label: e.proposal.title, value: e.key }))
				)
				.setMinValues(0)
				.setMaxValues(Math.min(includeOptions.length + 1, 25))
		),
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`poll.exclude.${pollKey}`)
				.setPlaceholder("Proposals to exclude")
				.setOptions(
					{ label: "[reset]", value: "-" },
					...excludeOptions.slice(0, 24).map((e) => ({ label: e.proposal.title, value: e.key }))
				)
				.setMinValues(0)
				.setMaxValues(Math.min(excludeOptions.length + 1, 25))
		),
	];
}

export function unusedProposals() {
	return proposalDb.filter((v) => v.used === false);
}
