import dotenv from "dotenv";
import app from "./app";
import sequelize from "./config/database.config";
import { SeederRunner } from "./seeders/seeder.runner";
import logger from "./utils/logger";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 7070;

const start = async () => {
	await sequelize.sync();
	logger.info("Database connection established");

	await SeederRunner.run();

	app.listen(PORT, "0.0.0.0", () => {
		logger.info(`Server running on http://localhost:${PORT}`);
	});
};

start();
