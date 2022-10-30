import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export abstract class Command {
	protected constructor(name: string) {
		this.name = name;
	}

	public readonly name: string;
	abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
	abstract register():
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
		| boolean;
}

export abstract class Button {
	public readonly name: string;

	protected constructor(name: string) {
		this.name = name;
	}

	abstract execute(interaction: ButtonInteraction, args: string[]): Promise<void>;
}

export abstract class SelectMenu {
	public readonly name: string;

	protected constructor(name: string) {
		this.name = name;
	}

	abstract execute(interaction: SelectMenuInteraction, args: string[]): Promise<void>;
}

export abstract class Modal {
	public readonly name: string;

	protected constructor(name: string) {
		this.name = name;
	}

	abstract execute(interaction: ModalSubmitInteraction, args: string[]): Promise<void>;
}

export abstract class Autocompleter {
	public readonly command: string;

	protected constructor(command: string) {
		this.command = command;
	}

	abstract execute(interaction: AutocompleteInteraction): Promise<void>;
}
