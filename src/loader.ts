import { Client, Collection } from "discord.js";
import { Command } from "./Command";
import * as fs from "fs";
import { ButtonHandler } from "./ButtonHandler";

export async function loadCommands(): Promise<Collection<string, Command>> {
	const loadedCommands = new Collection<string, Command>();
	await Promise.all(
		fs
			.readdirSync("./dist/commands")
			.filter((f) => f.endsWith(".js"))
			.map(async (filename) => {
				const cmd = (await import(`./commands/${filename}`)).default as Command;
				loadedCommands.set(cmd.name, cmd);
			})
	);
	return loadedCommands;
}

export async function loadButtonHandlers(): Promise<Collection<string, ButtonHandler>> {
	const loadedButtons = new Collection<string, ButtonHandler>();
	await Promise.all(
		fs
			.readdirSync("./dist/buttons")
			.filter((f) => f.endsWith(".js"))
			.map(async (filename) => {
				const buttonHandler = (await import(`./buttons/${filename}`)).default as ButtonHandler;
				loadedButtons.set(buttonHandler.name, buttonHandler);
			})
	);
	return loadedButtons;
}

export async function loadEvents(client: Client) {
	await Promise.all(
		fs
			.readdirSync("./dist/events")
			.filter((f) => f.endsWith(".js"))
			.map(async (filename) => {
				const { default: fun } = await import(`./events/${filename}`);
				client.on(filename.replace(".js", ""), fun);
			})
	);
}
