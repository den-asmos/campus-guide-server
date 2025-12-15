import dotenv from "dotenv";
import app from "./app";
import sequelize from "./config/database";
import { findPath } from "./graph/findPath";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 7070;

const start = async () => {
	await sequelize.sync();
	console.log("Database connection established");

	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});

	const path = await findPath("301", "309");
	console.log(path);
};

start();
