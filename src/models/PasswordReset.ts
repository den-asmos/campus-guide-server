import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import User from "./User";

export interface PasswordResetAttributes {
	id: number;
	userId: number;
	code: string;
	expiresAt: Date;
	isUsed: boolean;
}

interface PasswordReset extends PasswordResetAttributes {}

class PasswordReset
	extends Model<PasswordResetAttributes>
	implements PasswordResetAttributes {}

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
	},
);

export default PasswordReset;
