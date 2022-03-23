import { logger } from "../logger";

export default async function error(err: Error) {
	logger.error(`${err.name}: ${err.message}`);
	logger.debug(err.stack);
}
