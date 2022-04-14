import { AutocompleteInteraction } from "discord.js";

export abstract class Autocompleter {
	public readonly command: string;

	protected constructor(command: string) {
		this.command = command;
	}

	abstract execute(interaction: AutocompleteInteraction): Promise<void>;
}
