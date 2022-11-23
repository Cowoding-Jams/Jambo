import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { reminderDb } from "../../db";
import { DateTime } from "luxon";

class ReminderAutocompleter extends Autocompleter {
	constructor() {
		super("reminder");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const options: { name: string; value: number }[] = [];

		for (const [key, value] of reminderDb) {
			if (value.user === interaction.user.toString()) {
				let name = `ID: ${key} - ${DateTime.fromISO(value.timestamp).toFormat(
					"dd.MM.yyyy HH:mm:ss 'UTC'Z"
				)} ${value.ping ? `- ${value.ping} -` : "-"} ${
					value.message == "" ? "No message." : `${value.message}`
				}`;

				if (name.length > 100) {
					name = name.slice(0, 97) + "...";
				}

				options.push({
					name: name,
					value: parseInt(key.toString()),
				});
			}
		}

		await interaction.respond(
			options
				.filter((c) => c.value.toString().startsWith(interaction.options.getFocused() as string))
				.slice(0, 25)
		);
	}
}

export default new ReminderAutocompleter();
