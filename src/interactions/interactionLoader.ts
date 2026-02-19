import { Client, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { Autocompleter, Button, Command, Modal, SelectMenu } from "./interactionClasses.js";

export async function loadEvents(client: Client) {
	logger.debug("Loading events...");
	const dir = path.join(import.meta.dirname, "../events");
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const { default: fun } = await import(`../events/${filename}`);
				client.on(filename.replace(/\.(js|ts)$/, ""), fun);
			})
	);
}

export async function loadCommands(): Promise<Collection<string, Command>> {
	logger.debug("Loading commands...");
	const dir = path.join(import.meta.dirname, "../commands");
	const loadedCommands = new Collection<string, Command>();
	await Promise.all(
		fs
			.readdirSync(dir)
			.filter(isActive)
			.map(async (filename) => {
				const _command = (await import(`../commands/${filename}`)).default as Command;
				if (config.logActivity || _command.name !== "activity-tracker") {
					// When logActivity from the config is false every command except the activity-tracker should be loaded. If not this will always be true and all the commands will be loaded.
					loadedCommands.set(_command.name, _command);
				}
			})
	);
	return loadedCommands;
}

export async function loadButtons(): Promise<Collection<string, Button>> {
	logger.debug("Loading buttons...");
	const dir = path.join(import.meta.dirname, "./buttons");
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
	const dir = path.join(import.meta.dirname, "./selectMenus");
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
	const dir = path.join(import.meta.dirname, "./modals");
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
	const dir = path.join(import.meta.dirname, "./autocompleters");
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
	return (f.endsWith(".js") || f.endsWith(".ts")) && !f.startsWith("sample");
}
