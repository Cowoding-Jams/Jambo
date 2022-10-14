import { Autocompleter, Button, Command, Modal, SelectMenu } from "./interactionClasses";
import { logger } from "../logger";
import { Client, Collection } from "discord.js";
import fs from "fs";

export async function loadEvents(client: Client) {
	logger.debug("Loading events...");
	await Promise.all(
		fs.readdirSync("./dist/events").map(async (filename) => {
			const { default: fun } = await import(`./events/${filename}`);
			client.on(filename.replace(".js", ""), fun);
		})
	);
}

export async function loadCommands(): Promise<Collection<string, Command>> {
	logger.debug("Loading commands...");
	const loadedCommands = new Collection<string, Command>();
	await Promise.all(
		fs.readdirSync("./dist/commands").map(async (filename) => {
			const _command = (await import(`./commands/${filename}`)).default as Command;
			loadedCommands.set(_command.name, _command);
		})
	);
	return loadedCommands;
}

export async function loadButtons(): Promise<Collection<string, Button>> {
	logger.debug("Loading buttons...");
	const loadedButtons = new Collection<string, Button>();
	await Promise.all(
		fs.readdirSync("./dist/interactions/buttons").map(async (filename) => {
			const _button = (await import(`./buttons/interactions/${filename}`)).default as Button;
			loadedButtons.set(_button.name, _button);
		})
	);
	return loadedButtons;
}

export async function loadSelectMenus(): Promise<Collection<string, SelectMenu>> {
	logger.debug("Loading select menus...");
	const loadedSelectMenus = new Collection<string, SelectMenu>();
	await Promise.all(
		fs.readdirSync("./dist/interactions/selectMenus").map(async (filename) => {
			const _selectMenu = (await import(`./selectMenus/interactions/${filename}`)).default as SelectMenu;
			loadedSelectMenus.set(_selectMenu.name, _selectMenu);
		})
	);
	return loadedSelectMenus;
}

export async function loadModals(): Promise<Collection<string, Modal>> {
	logger.debug("Loading modals...");
	const loadedModals = new Collection<string, Modal>();
	await Promise.all(
		fs.readdirSync("./dist/interactions/modals").map(async (filename) => {
			const _modal = (await import(`./selectMenus/interactions/${filename}`)).default as Modal;
			loadedModals.set(_modal.name, _modal);
		})
	);
	return loadedModals;
}

export async function loadAutocompleters(): Promise<Collection<string, Autocompleter>> {
	logger.debug("Loading autocompleters...");
	const loadedAutocompleters = new Collection<string, Autocompleter>();
	await Promise.all(
		fs.readdirSync("./dist/interactions/autocompleters").map(async (filename) => {
			const _autocompleter = (await import(`./autocompleters/interactions/${filename}`))
				.default as Autocompleter;
			loadedAutocompleters.set(_autocompleter.command, _autocompleter);
		})
	);
	return loadedAutocompleters;
}
