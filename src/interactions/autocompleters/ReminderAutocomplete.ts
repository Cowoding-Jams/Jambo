import { AutocompleteInteraction } from "discord.js";
import { reminderDb } from "../../db.js";
import { autocompleteISODuration, autocompleteISOTime } from "../../util/misc/autocomplete.js";
import { shortDateTimeFormat } from "../../util/misc/time.js";
import { getUsernameOrRolename } from "../../util/misc/user.js";
import { Autocompleter } from "../interactionClasses.js";

class ReminderAutocompleter extends Autocompleter {
	constructor() {
		super("reminder");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const subCmd = interaction.options.getSubcommand();

		if (subCmd === "set") {
			const focus = interaction.options.getFocused(true);
			if (focus.name === "date-iso") {
				await autocompleteISOTime(interaction);
			} else {
				await autocompleteISODuration(interaction);
			}
		} else if (subCmd === "delete") {
			const options: { name: string; value: number }[] = [];

			for (const [key, value] of reminderDb) {
				if (value.user === interaction.user.id) {
					const ping = value.ping ? await getUsernameOrRolename(value.ping, interaction.guild!) : null;

					let name = `ID: ${key} ⁘ ${value.timestamp.toFormat(shortDateTimeFormat)} ${
						ping ? `⁘ ${ping} ⁘` : "⁘"
					} ${value.message == "" ? "No message." : `${value.message}`}`;

					if (name.length > 100) {
						name = name.slice(0, 97) + "...";
					}

					options.push({
						name: name,
						value: parseInt(key),
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
}

export default new ReminderAutocompleter();
