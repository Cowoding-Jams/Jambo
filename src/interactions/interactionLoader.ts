import { Autocompleter, Button, Command, Modal, SelectMenu } from "./interactionClasses";
import { logger } from "../logger";
import { Client, Collection } from "discord.js";
import { config } from "../config";
import fs from "fs";

export async function loadEvents(client: Client) {
	logger.debug("Loading events...");
	const dir = "./dist/events";
	checkDir(dir);
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const { default: fun } = await import(`../events/${filename}`);
				client.on(filename.replace(".js", ""), fun);
			})
	);
}

export async function loadCommands(): Promise<Collection<string, Command>> {
	logger.debug("Loading commands...");
	const dir = "./dist/commands";
	checkDir(dir);
	const loadedCommands = new Collection<string, Command>();
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const _command = (await import(`../commands/${filename}`)).default as Command;
				if (config.logActivity || _command.name !== "game-activity-tracker") {
					loadedCommands.set(_command.name, _command);
				}
			})
	);
	return loadedCommands;
}

export async function loadButtons(): Promise<Collection<string, Button>> {
	logger.debug("Loading buttons...");
	const dir = "./dist/interactions/buttons";
	checkDir(dir);
	const loadedButtons = new Collection<string, Button>();
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const _button = (await import(`./buttons/${filename}`)).default as Button;
				loadedButtons.set(_button.name, _button);
			})
	);
	return loadedButtons;
}

export async function loadSelectMenus(): Promise<Collection<string, SelectMenu>> {
	logger.debug("Loading select menus...");
	const dir = "./dist/interactions/selectMenus";
	checkDir(dir);
	const loadedSelectMenus = new Collection<string, SelectMenu>();
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const _selectMenu = (await import(`./selectMenus/${filename}`)).default as SelectMenu;
				loadedSelectMenus.set(_selectMenu.name, _selectMenu);
			})
	);
	return loadedSelectMenus;
}

export async function loadModals(): Promise<Collection<string, Modal>> {
	logger.debug("Loading modals...");
	const dir = "./dist/interactions/modals";
	checkDir(dir);
	const loadedModals = new Collection<string, Modal>();
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const _modal = (await import(`./modals/${filename}`)).default as Modal;
				loadedModals.set(_modal.name, _modal);
			})
	);
	return loadedModals;
}

export async function loadAutocompleters(): Promise<Collection<string, Autocompleter>> {
	logger.debug("Loading autocompleters...");
	const dir = "./dist/interactions/autocompleters";
	checkDir(dir);
	const loadedAutocompleters = new Collection<string, Autocompleter>();
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const _autocompleter = (await import(`./autocompleters/${filename}`)).default as Autocompleter;
				loadedAutocompleters.set(_autocompleter.command, _autocompleter);
			})
	);
	return loadedAutocompleters;
}

function isActive(f: string): boolean {
	return f.endsWith(".js") && !f.startsWith("sample");
}

function checkDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
}
