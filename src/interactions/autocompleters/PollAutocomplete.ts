import { Autocompleter } from "../interactionClasses";
import { AutocompleteInteraction } from "discord.js";

class PollAutocompleter extends Autocompleter {
	constructor() {
		super("poll");
	}

	async execute(interaction: AutocompleteInteraction): Promise<void> {
		await interaction.respond(["WIP"].map((e) => ({ name: e, value: e })));
	}
}

export default new PollAutocompleter();
