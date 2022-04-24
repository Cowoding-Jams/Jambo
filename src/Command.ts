import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export abstract class Command {
	protected constructor(name: string) {
		this.name = name;
	}

	public readonly name: string;
	abstract execute(interaction: CommandInteraction): Promise<void>;
	abstract register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
}
