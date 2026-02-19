import { logger } from "../logger.js";

export default async function error(err: Error) {
	logger.error(`${err.name}: ${err.message}`);
	logger.debug(err.stack);
}
