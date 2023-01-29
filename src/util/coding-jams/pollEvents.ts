import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { pollDb, pollEventsDb, proposalDb } from "../../db";
import { config } from "../../config";
import { addEmbedFooter } from "../misc/embeds";
import { discordRelativeTimestamp, discordTimestamp, durationToReadable } from "../misc/time";
import { getFromEnmap } from "../misc/enmap";
import { numberedList } from "../misc/format";

export async function beforeEvent(channel: TextChannel, pollID: string) {
	const poll = pollDb.get(pollID)!;

	const proposals = getFromEnmap(proposalDb, poll.proposals);
	const list = numberedList(
		proposals.map((p) => p.title),
		proposals.map((p) => durationToReadable(p.duration))
	);

	const embed = new EmbedBuilder()
		.setTitle(`${poll.title} coming up!`)
		.setDescription(
			`The poll for the next Jam is coming up and will open ${discordTimestamp(
				poll.start
			)}! That's ${discordRelativeTimestamp(poll.start)}! Voting will be closed ${discordTimestamp(
				poll.end
			)}. Currently the following proposals are the one we will vote from. Make sure they are all polished and ready to go!`
		)
		.addFields({ name: "Proposals", value: list.join("\n") });

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	await channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
}

export async function openEvent(channel: TextChannel, pollID: string) {
	const poll = pollDb.get(pollID)!;

	const embed = new EmbedBuilder()
		.setTitle("Time to vote!")
		.setDescription(
			`The ${poll.title} is starting now (${discordTimestamp(
				poll.start
			)}) and will close ${discordRelativeTimestamp(
				poll.end
			)}! The proposal with the most votes will be the next jam! You have ${poll.numVotes} votes.`
		);

	const proposals = getFromEnmap(proposalDb, poll.proposals);
	const list = numberedList(
		proposals.map((p) => p.title),
		proposals.map((p) => durationToReadable(p.duration))
	);

	embed.addFields(...list.map((v, i) => ({ name: v, value: proposals[i]?.description || "" })));

	const actionrow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId(`poll.vote.${pollID}`)
			.setPlaceholder("Vote!")
			.setOptions(proposals.map((p, i) => ({ label: p.title, value: poll.proposals[i] })))
			.setMinValues(0)
			.setMaxValues(poll.numVotes)
	);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;

	const message = await channel.send({
		embeds: [addEmbedFooter(embed)],
		components: [actionrow],
		content: jamRole.toString(),
	});

	poll.votingPrompt = message.id;
	pollDb.set(pollID, poll);

	pollEventsDb.set(pollEventsDb.autonum, {
		pollID: pollID,
		type: "close",
		date: poll.end,
		promptID: message.id,
	});
}

export async function closeEvent(channel: TextChannel, pollID: string) {
	const poll = pollDb.get(pollID)!;

	// Remove the selectMenu
	if (poll.votingPrompt) {
		const message = await channel.messages.fetch(poll.votingPrompt);
		await message.edit({ components: [] });
	}

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

	proposals.forEach((p, i) => {
		const votesPerProp = votesPerProposal[i];
		if (!p) return;
		p.votesLastPoll = votesPerProp.votes;
		p.totalVotes += votesPerProp.votes;
		p.polls += 1;

		proposalDb.set(votesPerProp.key, p);
	});

	const winner = proposals[0];
	const embed = new EmbedBuilder()
		.setTitle("Voting is closed!")
		.setDescription(
			`Thanks to everyone who voted!\nThe winner with incredible ${winner.votesLastPoll} votes is:`
		)
		.addFields(
			{
				name: `${winner.title} ⁘ Time: ${durationToReadable(winner.duration)}`,
				value: `${winner.description}\n${winner.references}`,
			},
			{
				name: `Top ${Math.min(10, proposals.length)} proposals`,
				value: numberedList(
					proposals.map((p) => p.title),
					proposals.map((p) => `${p.votesLastPoll}`)
				).join("\n"),
			}
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;

	await channel.send({ content: jamRole.toString(), embeds: [addEmbedFooter(embed)] });
}
