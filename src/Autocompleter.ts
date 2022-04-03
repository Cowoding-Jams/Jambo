import { AutocompleteInteraction } from "discord.js";

export abstract class Autocompleter {
	public readonly name: string;

	protected constructor(name: string) {
		this.name = name;
	}

	abstract execute(interaction: AutocompleteInteraction): Promise<void>;
}
