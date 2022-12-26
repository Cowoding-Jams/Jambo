import { logger } from "../logger"; // only there for logging

// set the function name to the event name
// and edit the parameter to fit in its type and name to the event
export default async function interactionName(args: unknown) {
	// do things if the event occurs
	logger.debug(args);
}
