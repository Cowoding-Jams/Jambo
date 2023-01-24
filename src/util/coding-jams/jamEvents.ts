import {
	EmbedBuilder,
	GuildScheduledEventCreateOptions,
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
	TextChannel,
} from "discord.js";
import { config } from "../../config";
import { jamDb, proposalDb } from "../../db";
import { addEmbedFooter } from "../misc/embeds";
import { discordRelativeTimestamp, discordTimestamp, durationToReadable } from "../misc/time";
import { viewProposalEmbed } from "../proposal/listProposals";

export async function createScheduledEventEvent(channel: TextChannel, jamID: string) {
	const jam = jamDb.get(jamID)!;
	const proposal = proposalDb.get(jam.proposal)!;

	const options: GuildScheduledEventCreateOptions = {
		name: proposal.title + " jam",
		description: `for the ${jam.title}.\n${proposal.description}`,
		scheduledStartTime: jam.start.toISO(),
		scheduledEndTime: jam.end.toISO(),
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.External,
		entityMetadata: { location: "Here!" },
	};

	channel.guild.scheduledEvents.create(options);

	const embed = new EmbedBuilder()
		.setTitle(`${proposal.title} coming up!`)
		.setDescription(
			`The next jam is planned and will start ${discordTimestamp(
				jam.start
			)}! That's ${discordRelativeTimestamp(
				jam.start
			)}! Make sure your calender is free :) I hope you can make it!\nThe current end is planned for ${discordTimestamp(
				jam.end
			)}. That would be ${durationToReadable(jam.end.diff(jam.start))}.`
		)
		.addFields(
			{
				name: "Description",
				value: proposal.description,
			},
			{
				name: "References",
				value: proposal.references !== "" ? proposal.references : "-",
			}
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
}

export async function startEvent(channel: TextChannel, jamID: string) {
	const jam = jamDb.get(jamID)!;
	const proposal = proposalDb.get(jam.proposal)!;

	const embed = new EmbedBuilder()
		.setTitle(`Time to jam!`)
		.setDescription(
			`The **${proposal.title} jam** has offically started now!\nI wish you all an incredible time and lots of fun!`
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	await channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });

	const createdChannel = await channel.guild.channels.create({
		name: proposal.abbreviation + "-results",
		parent: config.resultCategoryId,
		topic: `Results for the ${proposal.title} jam.`,
	});

	jam.resultChannelID = createdChannel.id;
	jamDb.set(jamID, jam);

	await createdChannel.send({ embeds: [await viewProposalEmbed(proposal, `(${jam.title})`)] });
	await createdChannel.send(
		"Here you can link to your work or directly upload your code :)\nIf you want to discuss something please create a thread to keep this tidy."
	);
}

export async function endEvent(channel: TextChannel, jamID: string) {
	const jam = jamDb.get(jamID)!;
	const proposal = proposalDb.get(jam.proposal)!;

	const embed = new EmbedBuilder()
		.setTitle(`The jam is over!`)
		.setDescription(
			`The ${proposal.title} jam has offically ended now! I hope you had a great time. I'm looking forward to the next jam already :)\nHop over in a voice channel to tell the others about your experience and present what you've done. If you can't join make sure to check out the results channel in the following days to see what all the others have created!`
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
}

export async function halftimeEvent(channel: TextChannel, jamID: string) {
	const jam = jamDb.get(jamID)!;
	const proposal = proposalDb.get(jam.proposal)!;

	const embed = new EmbedBuilder()
		.setTitle(`Halftime!`)
		.setDescription(
			`The ${proposal.title} jam is halfway over! Don't forget it ends ${discordTimestamp(
				jam.end
			)}! I hope you're having a great time and are making good progress. If you're stuck or need help, ask for it. There are always people willing to help. If you're done, make sure to share your work in ${
				jam.resultChannelID ? `<#${jam.resultChannelID}` : "the results channel"
			}.`
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
}

export async function closeToEndEvent(channel: TextChannel, jamID: string) {
	const jam = jamDb.get(jamID)!;
	const proposal = proposalDb.get(jam.proposal)!;

	const embed = new EmbedBuilder()
		.setTitle(`Last chance!`)
		.setDescription(
			`The ${proposal.title} jam is almost over! It ends ${discordRelativeTimestamp(
				jam.end
			)}! I hope you're having a great time and are making good progress. If you're done let others test you're code to see if there are maybe still some hidden bugs somewhere. Make sure to share your work in ${
				jam.resultChannelID ? `<#${jam.resultChannelID}` : "the results channel"
			}.`
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
}

export async function closeToStartEvent(channel: TextChannel, jamID: string) {
	const jam = jamDb.get(jamID)!;
	const proposal = proposalDb.get(jam.proposal)!;

	const embed = new EmbedBuilder()
		.setTitle(`Starting soon!`)
		.setDescription(
			`The ${proposal.title} jam is starting soon ${discordRelativeTimestamp(
				jam.start
			)}! Make sure to setup your coding enviroment, put on some fresh pants, get yourself some water and fruity snacks. This is going to be great :)`
		);

	const jamRole =
		channel.guild.roles.cache.find((v) => v.name === config.jamRoleName) || channel.guild.roles.everyone;
	channel.send({ embeds: [addEmbedFooter(embed)], content: jamRole.toString() });
}
