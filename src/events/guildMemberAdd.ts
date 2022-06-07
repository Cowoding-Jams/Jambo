import { GuildMember } from "discord.js";
import { logger } from "../logger";

export default async function guildMemberAdd(member: GuildMember) {
	const welcomeMessage = `Hey ${member.user.username} :)\nWelcome on ${member.guild.name}`;

	logger.debug("Someone new joined the guild");
	if (member.guild.systemChannel) {
		member.guild.systemChannel.send(welcomeMessage);
	} else {
		member.user.send(welcomeMessage);
	}
}
