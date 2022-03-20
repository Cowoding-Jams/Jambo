import { ButtonInteraction } from "discord.js";

export interface ButtonHandler {
	execute(interaction: ButtonInteraction): Promise<void>;
	getName(): string;
}
