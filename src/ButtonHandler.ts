import { ButtonInteraction } from "discord.js";

export abstract class ButtonHandler {
	public readonly name: string;

	protected constructor(name: string) {
		this.name = name;
	}

	abstract execute(interaction: ButtonInteraction): Promise<void>;
}
