import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { jamDb, pollDb } from "../../db";

class PollAutocompleter extends Autocompleter {
	constructor() {
		super("coding-jams");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const subCmdGroup = interaction.options.getSubcommandGroup();

		if (subCmdGroup == "poll") {
			await interaction.respond(
				pollDb
					.keyArray()
					.slice(0, 25)
					.map((c) => ({ name: c, value: c }))
			);
		} else if (subCmdGroup == "jam") {
			await interaction.respond(
				jamDb
					.keyArray()
					.slice(0, 25)
					.map((c) => ({ name: c, value: c }))
			);
		}
	}
}

export default new PollAutocompleter();
