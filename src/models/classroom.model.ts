import {
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
} from "sequelize";
import sequelize from "../config/database.config";

export enum Floor {
	first = 1,
	second = 2,
	third = 3,
	fourth = 4,
	fifth = 5,
	sixth = 6,
	seventh = 7,
}

export class Classroom extends Model<
	InferAttributes<Classroom>,
	InferCreationAttributes<Classroom>
> {
	declare id: string;
	declare title: string;
	declare description: string;
	declare floor: Floor;
	declare latitude: number;
	declare longitude: number;
}

Classroom.init(
	{
		id: {
			type: DataTypes.STRING,
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
		underscored: true,
	},
);
