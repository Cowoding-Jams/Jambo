import winston from "winston";
import { config } from "./config";

export const logger = winston.createLogger({
	level: config.logLevel,
	format: winston.format.combine(
		winston.format.splat(),
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.printf((info) => {
			return `[${info.timestamp}] ${info.level}: ${info.message}`;
		}),
		winston.format.colorize({ all: true })
	),
	transports: [
		new winston.transports.File({ filename: "logs/error.log", level: "error" }),
		new winston.transports.Console(),
	],
});
