import { EmbedBuilder, GuildMember, inlineCode } from "discord.js";
import { config } from "../config.js";
import { addEmbedFooter } from "../util/misc/embeds.js";

const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });

const getOrdinalSuffix = (n: number) =>
	({
		zero: "th",
		one: "st",
		two: "nd",
		few: "rd",
		many: "th",
		other: "th",
	})[ordinalRules.select(n)];

export default async function guildMemberAdd(member: GuildMember) {
	let embed = new EmbedBuilder()
		.setTitle(`Hey ${member.displayName} 😊`)
		.setThumbnail(member.guild.iconURL({ size: 1024 }) || "")
		.setDescription(
			`You are the ${member.guild.memberCount}${getOrdinalSuffix(
				member.guild.memberCount
			)} member of this server!`
		)
		.addFields(
			{
				name: `Welcome to ${member.guild.name}!`,
				value: config.serverDescription,
			},
			{
				name: `I am ${config.botName} <3`,
				value: `I manage this whole server from creating polls to welcoming new members like you. I have a lot of cool features. You can find out more about them by using ${inlineCode(
					"/help"
				)} in any channel. If I need something from you I'll ping you like this <@${member.user.id}> :)`,
			}
		);
	embed = addEmbedFooter(embed);

	if (member.guild.systemChannel) {
		member.guild.systemChannel.send({ embeds: [embed] });
	} else {
		member.user.send({ embeds: [embed] });
	}
}
