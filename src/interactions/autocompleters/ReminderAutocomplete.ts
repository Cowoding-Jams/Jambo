import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { reminderDb } from "../../db";
import { timestampToReadable } from "../../util/reminderCommand/reminderUtil";

class ReminderAutocompleter extends Autocompleter {
	constructor() {
		super("reminder");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const options: { name: string; value: number }[] = [];

		for (const [key, value] of reminderDb) {
			if (value.pings[0] === interaction.user.toString()) {
				const id = value.pings[1].replace(/\D/g, "");
				const role = await interaction.guild?.roles.fetch(id);
				const member = await interaction.guild?.members.fetch(id).catch(() => null);

				options.push({
					name: `ID: ${key} - ${timestampToReadable(value.timestamp, true)} ${
						role || member ? `- @${role ? role.name : member?.displayName} -` : "-"
					} ${value.message == "" ? "No message." : `${value.message}`}`,
					value: parseInt(key.toString()),
				});
			}
		}

		await interaction.respond(
			options.filter((c) => c.value.toString().startsWith(interaction.options.getFocused() as string))
		);
	}
}

export default new ReminderAutocompleter();
