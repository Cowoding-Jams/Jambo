import { Client, Collection } from "discord.js";
import { Command } from "./Command";
import { Autocompleter } from "./Autocompleter";
import fs from "fs";
import { ButtonHandler } from "./ButtonHandler";
import { logger } from "./logger";
import { SelectMenuHandler } from "SelectMenuHandler";

export async function loadCommands(): Promise<Collection<string, Command>> {
	logger.debug("loading commands...");
	const loadedCommands = new Collection<string, Command>();
	await Promise.all(
		fs
			.readdirSync("./dist/commands")
			.filter(isActive)
			.map(async (filename) => {
				const cmd = (await import(`./commands/${filename}`)).default as Command;
				loadedCommands.set(cmd.name, cmd);
			})
	);
	return loadedCommands;
}

export async function loadButtonHandlers(): Promise<Collection<string, ButtonHandler>> {
	logger.debug("loading buttons...");
	const loadedButtons = new Collection<string, ButtonHandler>();
	await Promise.all(
		fs
			.readdirSync("./dist/buttons")
			.filter(isActive)
			.map(async (filename) => {
				const buttonHandler = (await import(`./buttons/${filename}`)).default as ButtonHandler;
				loadedButtons.set(buttonHandler.name, buttonHandler);
			})
	);
	return loadedButtons;
}

export async function loadSelectMenuHandlers(): Promise<Collection<string, SelectMenuHandler>> {
	logger.debug("loading selectmenus...");
	const loadedSelectMenus = new Collection<string, SelectMenuHandler>();
	await Promise.all(
		fs
			.readdirSync("./dist/selectmenus")
			.filter(isActive)
			.map(async (filename) => {
				const selectMenuHandler = (await import(`./selectmenus/${filename}`)).default as SelectMenuHandler;
				loadedSelectMenus.set(selectMenuHandler.name, selectMenuHandler);
			})
	);
	return loadedSelectMenus;
}

export async function loadEvents(client: Client) {
	logger.debug("loading events...");
	await Promise.all(
		fs
			.readdirSync("./dist/events")
			.filter(isActive)
			.map(async (filename) => {
				const { default: fun } = await import(`./events/${filename}`);
				client.on(filename.replace(".js", ""), fun);
			})
	);
}

export async function loadAutocompleters(): Promise<Collection<string, Autocompleter>> {
	logger.debug("loading autocompleters...");
	const loadedAutocompleters = new Collection<string, Autocompleter>();
	await Promise.all(
		fs
			.readdirSync("./dist/autocompleters")
			.filter(isActive)
			.map(async (filename) => {
				const autocompleter = (await import(`./autocompleters/${filename}`)).default as Autocompleter;
				loadedAutocompleters.set(autocompleter.command, autocompleter);
			})
	);
	return loadedAutocompleters;
}

function isActive(f: string): boolean {
	return f.endsWith(".js") && !f.startsWith("sample");
}
