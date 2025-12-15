import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

export interface ClassroomAttributes {
	id: number;
	title: string;
	description: string;
	floor: number;
	latitude: number;
	longitude: number;
}

interface Classroom extends ClassroomAttributes {}

class Classroom
	extends Model<ClassroomAttributes>
	implements ClassroomAttributes {}

Classroom.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		floor: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1,
				max: 7,
			},
		},
		latitude: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		longitude: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		sequelize,
		modelName: "Classroom",
		tableName: "classroom",
		timestamps: false,
	}
);

export default Classroom;
