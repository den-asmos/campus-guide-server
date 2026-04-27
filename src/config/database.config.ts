import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize({
	dialect: "postgres",
	host: "localhost",
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	logging: false,
	define: {
		timestamps: false,
	},
});

export default sequelize;
