import { Command } from "../interactions/interactionClasses";
import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	GuildMember,
	SlashCommandBuilder,
	User,
} from "discord.js";
import { addDefaultEmbedFooter } from "../util/misc/embeds";

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

function getUserEmbed(user: User, member: GuildMember | null | undefined): EmbedBuilder {
	const embed = new EmbedBuilder()
		.setTitle(
			`${user.tag} ${member ? "aka. " + member.displayName : ""} ${
				user.system ? "| System" : user.bot ? "| Bot" : ""
			}`
		)
		.setThumbnail(user.displayAvatarURL({ size: 1024 }))
		.setDescription(user.toString());

	embed.addFields({ name: "User Id", value: user.id, inline: true });

	if (user.flags?.toArray().length) {
		embed.addFields({
			name: "Discord Badges",
			value: user.flags
				.toArray()
				.map((v) => v.toLowerCase().replace(/_/g, " "))
				.join(", ")
				.replace(/\b(.)/g, (c) => c.toUpperCase()),
		});
	}

	embed.addFields({
		name: "Account created",
		value: `<t:${toUnix(user.createdTimestamp)}> ⁘ <t:${toUnix(user.createdTimestamp)}:R>`,
	});

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
			embed.addFields({
				name: "Joined server",
				value: `<t:${toUnix(member.joinedTimestamp)}> ⁘ <t:${toUnix(member.joinedTimestamp)}:R>`,
				inline: true,
			});

		embed.addFields({ name: "Boosting", value: boosting, inline: true }, { name: "Roles", value: roles });
	}
	return addDefaultEmbedFooter(embed);
}

export default new UserInfoCommand();
