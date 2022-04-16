import { SelectMenuInteraction } from "discord.js";

export abstract class SelectMenuHandler {
	public readonly name: string;

	protected constructor(name: string) {
		this.name = name;
	}

	abstract execute(interaction: SelectMenuInteraction, args: string[]): Promise<void>;
}
