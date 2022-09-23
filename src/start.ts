import "dotenv/config";
import { loadAutocompleters, loadButtonHandlers, loadCommands, loadEvents } from "./loader";
import { Client } from "discord.js";
import { ctx } from "./ctx";
import { logger } from "./logger";

function shutdown(info: number | unknown | Error) {
	logger.error("Shutting down unexpectedly...");
	logger.error(`Shutting down with info: ${info instanceof Error ? info.message : info}`);
	if (info instanceof Error) {
		logger.debug(info.stack);
	}
	client.destroy();
	//ctx.db.shutdown()
	process.exit(1);
}

async function start(): Promise<Client> {
	logger.debug("Creating client...");
	const client = new Client({ intents: ["GUILDS"] });

	logger.debug("Loading context...");
	ctx.update(await loadCommands(), await loadButtonHandlers(), await loadAutocompleters());
	logger.debug("Loading events...");
	await loadEvents(client);
	logger.debug("Attempting login");
	await client.login(process.env.TOKEN);
	logger.info("Successfully started Application");
	return client;
}

process.on("unhandledRejection", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", shutdown);

const client = await start();
