import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const { combine, timestamp, colorize, printf, json } = winston.format;

const devFormat = combine(
	colorize(),
	timestamp({ format: "HH:mm:ss" }),
	printf(({ level, message, timestamp, ...meta }) => {
		const metaString = Object.keys(meta).length
			? `${JSON.stringify(meta)}`
			: "";
		return `[${timestamp}] ${level}: ${message}${metaString}`;
	}),
);

const prodFormat = combine(timestamp(), json());

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL ?? "info",
	format: process.env.MODE === "production" ? prodFormat : devFormat,
	transports: [new winston.transports.Console()],
});

export default logger;
