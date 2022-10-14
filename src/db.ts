import Enmap from "enmap";

interface Reminder {
	timestamp: number;
	message: string;
	channel: string;
	user: string;
	callAll: boolean;
}

export const reminderTimeoutCache = new Map<number, NodeJS.Timeout>();
export const reminderDb = new Enmap<number, Reminder>("reminder");
export const latexDb = new Enmap<string, string>("latex");
