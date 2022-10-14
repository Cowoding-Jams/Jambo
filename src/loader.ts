import { Autocompleter, Button, Command, SelectMenu } from "././interactionClasses";
import { logger } from "./logger";
import { Client, Collection } from "discord.js";
import fs from "fs";

export async function loadCommands(): Promise<Collection<string, Command>> {
	logger.debug("Loading commands...");
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

export async function loadButtons(): Promise<Collection<string, Button>> {
	logger.debug("Loading buttons...");
	const loadedButtons = new Collection<string, Button>();
	await Promise.all(
		fs
			.readdirSync("./dist/buttons")
			.filter(isActive)
			.map(async (filename) => {
				const button = (await import(`./buttons/${filename}`)).default as Button;
				loadedButtons.set(button.name, button);
			})
	);
	return loadedButtons;
}

export async function loadSelectMenus(): Promise<Collection<string, SelectMenu>> {
	logger.debug("Loading select menus...");
	const loadedSelectMenus = new Collection<string, SelectMenu>();
	await Promise.all(
		fs
			.readdirSync("./dist/selectMenus")
			.filter(isActive)
			.map(async (filename) => {
				const selectMenu = (await import(`./selectMenus/${filename}`)).default as SelectMenu;
				loadedSelectMenus.set(selectMenu.name, selectMenu);
			})
	);
	return loadedSelectMenus;
}

export async function loadEvents(client: Client) {
	logger.debug("Loading events...");
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
	logger.debug("Loading autocompleters...");
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
