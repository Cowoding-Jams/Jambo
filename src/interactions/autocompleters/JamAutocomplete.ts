import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";
import { jamDb, pollDb } from "../../db";

class PollAutocompleter extends Autocompleter {
	constructor() {
		super("coding-jams");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		const subCmdGroup = interaction.options.getSubcommandGroup();
		//const subCmd = interaction.options.getSubcommand();

		let db;

		if (subCmdGroup == "poll") {
			db = pollDb;
		} else {
			// (subCmdGroup == "jam")
			db = jamDb;
		}

		const focus = interaction.options.getFocused(true);
		await interaction.respond(
			db
				.keyArray()
				.filter((k) => k.toLowerCase().startsWith(focus.value.toLowerCase()))
				.slice(0, 25)
				.map((c) => ({ name: c, value: c }))
		);
	}
}

export default new PollAutocompleter();
