import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export abstract class Command {
	protected constructor(name: string) {
		this.name = name;
	}

	public readonly name: string;
	abstract execute(interaction: CommandInteraction): Promise<void>;
	abstract register(): SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
}
