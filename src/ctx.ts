import { ButtonHandler } from "./ButtonHandler";
import { Collection } from "discord.js";
import { Command } from "./Command";
import { Autocompleter } from "Autocompleter";
import { SelectMenuHandler } from "SelectMenuHandler";

class Ctx {
	public readonly defaultGuild;
	public readonly commands: Collection<string, Command> = new Collection<string, Command>();
	public readonly buttons: Collection<string, ButtonHandler> = new Collection<string, ButtonHandler>();
	public readonly selectmenus: Collection<string, SelectMenuHandler> = new Collection<string, SelectMenuHandler>();
	public readonly autocompleters: Collection<string, Autocompleter> = new Collection<string, Autocompleter>();
	public readonly logLevel: string;

	constructor() {
		const { DEFAULT_GUILD, LOG_LEVEL } = process.env;
		if (!DEFAULT_GUILD) throw new Error("Default guild not defined!");

		this.defaultGuild = DEFAULT_GUILD;
		this.logLevel = LOG_LEVEL || "error";
	}

	update(
		commands: Collection<string, Command>,
		buttons: Collection<string, ButtonHandler>,
		autocompleters: Collection<string, Autocompleter>,
		selectmenus: Collection<string, SelectMenuHandler>
	) {
		commands.forEach((v, k) => this.commands.set(k, v));
		buttons.forEach((v, k) => this.buttons.set(k, v));
		autocompleters.forEach((v, k) => this.autocompleters.set(k, v));
		selectmenus.forEach((v, k) => this.selectmenus.set(k, v));
	}
}

export const ctx = new Ctx();
