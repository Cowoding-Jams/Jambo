import { AutocompleteInteraction } from "discord.js";
import { DateTime, Duration } from "luxon";
import { getTimezonefromRole } from "./role";

export async function autocompleteISOTime(interaction: AutocompleteInteraction) {
	const focus = interaction.options.getFocused().toUpperCase();

	const response = [];

	if (focus.length !== 0) {
		const date = DateTime.fromISO(focus, { setZone: true });
		if (date.isValid) {
			response.push({ name: "[Valid] " + date.toISO(), value: date.toISO() });
		} else {
			response.push({ name: "[Invalid] " + focus, value: focus });
		}
	} else {
		const timezone = await getTimezonefromRole(interaction.user.id, interaction.guild!);
		const now = DateTime.now()
			.set({ hour: DateTime.now().hour + 1, minute: 0, second: 0, millisecond: 0 })
			.setZone(timezone || "UTC")
			.toISO();
		response.push({ name: now, value: now });
	}

	await interaction.respond(response);
}

export async function autocompleteISODuration(interaction: AutocompleteInteraction) {
	const focus = interaction.options.getFocused().toUpperCase();

	const response = [];

	if (focus.length !== 0) {
		const duration = Duration.fromISO(focus);
		if (duration.isValid) {
			response.push({ name: "[Valid] " + duration.toISO(), value: duration.toISO() });
		} else {
			response.push({ name: "[Invalid] " + focus, value: focus });
		}
	} else {
		const example = Duration.fromDurationLike({ days: 3, hours: 2 }).toISO();
		response.push({ name: example, value: example });
	}

	await interaction.respond(response);
}