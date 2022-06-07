import { DMChannel, GuildMember } from "discord.js";

export default async function guildMemberAdd(member: GuildMember) {
	const welcomeMessage = `Hey ${member.user.username} :)`;

	if (member.guild.systemChannel) {
		member.guild.systemChannel.send(welcomeMessage);
	} else {
		member.createDM().then((channel: DMChannel) => channel.send(welcomeMessage));
	}
}
