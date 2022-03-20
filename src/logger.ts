import winston from "winston";
import { ctx } from "./ctx";

export const logger = winston.createLogger({
	level: ctx.logLevel,
	format: winston.format.combine(
		winston.format.splat(),
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.printf((info) => {
			return `[${info.timestamp}] ${info.level}: ${info.message}`;
		}),
		winston.format.colorize({ all: true })
	),
	transports: [
		new winston.transports.File({ filename: "logs/errorTs.log", level: "error" }),
		new winston.transports.Console(),
	],
});
