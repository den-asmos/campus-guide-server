import dotenv from "dotenv";
import app from "./app";
import sequelize from "./config/database";

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 7070;

const start = async () => {
	await sequelize.sync();
	console.log("Database connection established");

	app.listen(PORT, "0.0.0.0", () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});

	// const directionService = new DirectionService();
	// const response = await directionService.buildDirection({
	// 	origin: "703",
	// 	destination: "303",
	// });
	// console.log(response);
};

start();
