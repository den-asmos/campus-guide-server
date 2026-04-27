import {
	CreationOptional,
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
} from "sequelize";
import sequelize from "../config/database.config";
import { User } from "./user.model";

export class PasswordReset extends Model<
	InferAttributes<PasswordReset>,
	InferCreationAttributes<PasswordReset>
> {
	declare id: CreationOptional<number>;
	declare userId: number;
	declare code: string;
	declare expiresAt: Date;
	declare isUsed: boolean;
}

PasswordReset.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
		},
		code: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				len: [6, 6],
			},
		},
		expiresAt: {
			type: DataTypes.DATE,
			allowNull: false,
			validate: {
				isDate: true,
			},
		},
		isUsed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	},
	{
		sequelize,
		modelName: "PasswordReset",
		tableName: "password_reset",
		timestamps: false,
		underscored: true,
	},
);
