import { Client, CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export interface Command {
	getName(): string;
	execute(interaction: CommandInteraction): Promise<void>;
	register(client: Client): SlashCommandBuilder;
}
