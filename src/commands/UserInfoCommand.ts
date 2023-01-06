import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
	roleMention,
	SlashCommandBuilder,
	User,
} from "discord.js";
import { addEmbedFooter } from "../util/misc/embeds";
import { discordRelativeTimestamp, discordTimestamp } from "../util/misc/time";

class UserInfoCommand extends Command {
	constructor() {
		super("user-info");
	}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const user: User = interaction.options.getUser("user", true);
		const member: GuildMember | null | undefined = await interaction.guild?.members
			.fetch(user.id)
			.catch(() => null);

		await interaction.reply({ embeds: [getUserEmbed(user, member)] });
	}

	register(): Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand"> {
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

function getUserEmbed(user: User, member: GuildMember | null | undefined): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setTitle(
			`${user.tag} ${member ? "aka. " + member.displayName : ""} ${
				user.system ? "| System" : user.bot ? "| Bot" : ""
			}`
		)
		.setThumbnail(user.displayAvatarURL({ size: 1024 }))
		.setDescription(user.toString());

	embed.addFields({ name: "User Id", value: user.id });

	embed.addFields({
		name: "Account created",
		value: discordRelativeTimestamp(toUnix(user.createdTimestamp)),
		inline: true,
	});

	if (member) {
		let roles = "";
		member.roles.cache.forEach((role) => {
			if (role.id === role.guild.id) return;
			roles += roleMention(role.id);
		});

		if (member.joinedTimestamp)
			embed.addFields({
				name: "Joined server",
				value: discordRelativeTimestamp(toUnix(member.joinedTimestamp)),
				inline: true,
			});

		const boosting = member.premiumSince
			? `Since ${discordTimestamp(toUnix(member.premiumSince))} <3`
			: "Not boosting (yet) :(";

		if (!user.bot) embed.addFields({ name: "Boosting", value: boosting, inline: true });

		if (user.flags?.toArray().length) {
			embed.addFields({
				name: "Discord Badges",
				value: user.flags
					.toArray()
					.map((v) => v.replace(/[A-Z0-9]/g, " $&").trim())
					.join(", "),
			});
		}

		embed.addFields({ name: "Roles", value: roles });
	}
	return addEmbedFooter(embed);
}

export default new UserInfoCommand();
