import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize({
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	dialect: "postgres",
	host: "localhost",
	logging: false,
	define: {
		timestamps: false,
	},
});

export default sequelize;
