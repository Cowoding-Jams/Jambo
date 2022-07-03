import { Command } from "../Command";
import { CommandInteraction, GuildMember, MessageEmbed, User } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { addDefaultEmbedFooter } from "../util/embeds";

class UserInfoCommand extends Command {
	constructor() {
		super("user-info");
	}

	async execute(interaction: CommandInteraction): Promise<void> {
		const user: User = interaction.options.getUser("user", true);
		const member: GuildMember | null | undefined = await interaction.guild?.members.fetch(user.id).catch(() => null);

		await interaction.reply({ embeds: [getUserEmbed(user, member)] });
	}

	register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
		return new SlashCommandBuilder()
			.setName("user-info")
			.setDescription("Get information about a user")
			.addUserOption((option) =>
				option.setName("user").setDescription("The user to get information about.").setRequired(true)
			);
	}
}

const toUnix = (timestamp: number | Date) => {
	if (timestamp instanceof Date) timestamp = timestamp.getTime();
	return Math.floor(timestamp / 1000);
};

function getUserEmbed(user: User, member: GuildMember | null | undefined): MessageEmbed {
	const embed = new MessageEmbed()
		.setTitle(
			`${user.tag} ${member ? "aka. " + member.displayName : ""} ${user.system ? "| System" : user.bot ? "| Bot" : ""}`
		)
		.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
		.setDescription(user.toString());

	embed.addField("User Id", user.id, true);

	if (user.flags?.toArray().length) {
		embed.addField(
			"Discord Badges",
			user.flags
				.toArray()
				.map((v) => v.toLowerCase().replace(/_/g, " "))
				.join(", ")
				.replace(/\b(.)/g, (c) => c.toUpperCase())
		);
	}

	embed.addField("Account created", `<t:${toUnix(user.createdTimestamp)}> ⁘ <t:${toUnix(user.createdTimestamp)}:R>`);

	if (member) {
		let roles = "";
		member.roles.cache.forEach((role) => {
			if (role.id === role.guild.id) return;
			roles += `<@&${role.id}> `;
		});

		const boosting = member.premiumSince
			? `Since <t:${toUnix(member.premiumSince)}> ⁘ <t:${toUnix(member.premiumSince)}:R> :)`
			: "Not boosting :(";

		if (member.joinedTimestamp)
			embed.addField(
				"Joined server",
				`<t:${toUnix(member.joinedTimestamp)}> ⁘ <t:${toUnix(member.joinedTimestamp)}:R>`,
				true
			);

		embed.addField("Boosting", boosting, true).addField("Roles", roles);
	}
	return addDefaultEmbedFooter(embed);
}

export default new UserInfoCommand();
