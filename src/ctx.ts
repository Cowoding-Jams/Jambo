import { Autocompleter, Button, Command, Modal, SelectMenu } from "./interactions/interactionClasses";
import { Collection } from "discord.js";
import { config } from "./config";

class Ctx {
	public readonly defaultGuild;
	public readonly commands: Collection<string, Command> = new Collection<string, Command>();
	public readonly buttons: Collection<string, Button> = new Collection<string, Button>();
	public readonly selectMenus: Collection<string, SelectMenu> = new Collection<string, SelectMenu>();
	public readonly modals: Collection<string, Modal> = new Collection<string, Modal>();
	public readonly autocompleters: Collection<string, Autocompleter> = new Collection<string, Autocompleter>();
	public readonly logLevel: string;

	constructor() {
		if (!process.env.DEFAULT_GUILD) throw new Error("Default guild not defined!");

		this.defaultGuild = process.env.DEFAULT_GUILD;
		this.logLevel = config.logLevel || "error";
	}

	update(
		commands: Collection<string, Command>,
		buttons: Collection<string, Button>,
		selectMenus: Collection<string, SelectMenu>,
		modals: Collection<string, Modal>,
		autocompleters: Collection<string, Autocompleter>
	) {
		commands.forEach((v, k) => this.commands.set(k, v));
		buttons.forEach((v, k) => this.buttons.set(k, v));
		selectMenus.forEach((v, k) => this.selectMenus.set(k, v));
		modals.forEach((v, k) => this.modals.set(k, v));
		autocompleters.forEach((v, k) => this.autocompleters.set(k, v));
	}
}

export const ctx = new Ctx();
