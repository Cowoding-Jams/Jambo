import { ColorResolvable, ComponentEmojiResolvable, Guild } from "discord.js";

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
