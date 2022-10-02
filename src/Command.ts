import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export abstract class Command {
	protected constructor(name: string) {
		this.name = name;
	}

	public readonly name: string;
	abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
	abstract register():
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
}
