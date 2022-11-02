import { ChatInputCommandInteraction, ColorResolvable, ComponentEmojiResolvable, Guild } from "discord.js";
import { logger } from "../../logger";

export async function setUpRoles(
	guild: Guild | null,
	roles: [string, ColorResolvable][] | [string][],
	startSeparator: string,
	endSeparator: string
): Promise<boolean> {
	const guildRoles = await guild?.roles.fetch();
	if (!guildRoles) {
		return false;
	}

	if (!guildRoles.map((r) => r.name).includes(startSeparator)) {
		await guild?.roles.create({
			name: startSeparator,
			position: 1,
		});
		await guild?.roles.create({
			name: endSeparator,
			position: 1,
		});
	}

	const separatorPos = guildRoles.find((r) => r.name === startSeparator)?.position ?? 2;
	const endSeparatorPos = guildRoles.find((r) => r.name === endSeparator)?.position ?? 1;
	const existingRoles = guildRoles.filter((r) => r.position > endSeparatorPos && r.position < separatorPos);

	// Delete roles that are no longer in the config
	for (const role of existingRoles) {
		if (!roles.map((r) => r[0]).includes(role[1].name)) {
			await role[1].delete();
		}
	}

	// Create roles that are in the config but not in the guild
	for (const role of roles) {
		if (!guildRoles.map((r) => r.name).includes(role[0])) {
			await guild?.roles.create({
				name: role[0],
				color: role[1],
				position: endSeparatorPos + 1,
			});
		}
	}

	return true;
}

export async function deleteRoles(interaction: ChatInputCommandInteraction): Promise<void> {
	const all = interaction.options.getBoolean("all");
	const start = interaction.options.getRole("start");
	const end = interaction.options.getRole("end");

	const guildRoles = await interaction.guild?.roles.fetch();

	if (!guildRoles) {
		logger.error("Could not fetch guild roles");
		await interaction.editReply("Couldn't fetch the roles...");
		return;
	}

	const roles = guildRoles.map((r) => r).sort((a, b) => b.position - a.position);

	if (all) {
		let deleteRoles = false;

		for (const role of roles) {
			if (role.name.startsWith("-") && role.name.endsWith("-")) {
				deleteRoles = !deleteRoles;
				role.delete();
			} else if (deleteRoles) {
				role.delete();
			}
		}
	} else if (start && end) {
		let deleteRoles = false;

		for (const role of roles) {
			if (role.id === start.id) {
				deleteRoles = true;
				role.delete();
			} else if (role.id === end.id) {
				deleteRoles = false;
				role.delete();
			} else if (deleteRoles) {
				role.delete();
			}
		}
	} else {
		await interaction.editReply({
			content: "You have to select two roles if you don't want me to delete all generated roles...",
		});
	}

	await interaction.editReply({ content: "Deleted the roles!" });
}

export function bringIntoButtonGrid(
	roles: [string][] | [string, ComponentEmojiResolvable | null][]
): ([string][] | [string, ComponentEmojiResolvable | null][])[] {
	const n = roles.length;
	const quotients = [n / 5, n / 4, n / 3];

	if (quotients[0] < 1) {
		return [roles];
	} else {
		const diffs = quotients.map((q) => Math.ceil(q) - q);
		const columns = 5 - diffs.indexOf(Math.min(...diffs));
		const rows = Math.ceil(n / columns);
		const output = [];
		for (let i = 0; i < rows; i++) {
			output.push(roles.slice(i * columns, (i + 1) * columns));
		}
		return output;
	}
}
