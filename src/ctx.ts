import { ButtonHandler } from "./ButtonHandler";
import { Collection } from "discord.js";
import { Command } from "./Command";

class Ctx {
	public readonly defaultGuild;
	public readonly commands: Collection<string, Command> = new Collection<string, Command>();
	public readonly buttons: Collection<string, ButtonHandler> = new Collection<string, ButtonHandler>();
	public readonly logLevel: string;

	// Databases are gonna go here

	constructor() {
		this.defaultGuild = process.env.DEFAULT_GUILD || "";
		this.logLevel = process.env.LOG_LEVEL || "error";
	}

	update(commands: Collection<string, Command>, buttons: Collection<string, ButtonHandler>) {
		commands.forEach((v, k) => this.commands.set(k, v));
		buttons.forEach((v, k) => this.buttons.set(k, v));
	}
}

export const ctx = new Ctx();
