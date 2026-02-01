import bcrypt from "bcryptjs";
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export enum Role {
	student = "student",
	lecturer = "lecturer",
	admin = "admin",
}

export enum Gender {
	male = "male",
	female = "female",
}

export enum Faculty {
	"ФМиИТ" = "ФМиИТ",
	"ФХБиГН" = "ФХБиГН",
	"ПФ" = "ПФ",
	"ФСПиП" = "ФСПиП",
	"ФФКиС" = "ФФКиС",
	"ФГЗиК" = "ФГЗиК",
	"ХГФ" = "ХГФ",
	"ЮФ" = "ЮФ",
}

export enum Group {
	// ПФ
	"25ДО1д" = "25ДО1д",
	"25МО1д" = "25МО1д",
	"25НО1д" = "25НО1д",
	"25СПиИО1д" = "25СПиИО1д",
	"24ДО1д" = "24ДО1д",
	"24МО1д" = "24МО1д",
	"24НО1д" = "24НО1д",
	"24СПиИО1д" = "24СПиИО1д",
	"23ДО1д" = "23ДО1д",
	"23МО1д" = "23МО1д",
	"23НО1д" = "23НО1д",
	"23СПиИО1д" = "23СПиИО1д",
	"22ДО1д" = "22ДО1д",
	"22МИРХ1д" = "22МИРХ1д",
	"22НО1д" = "22НО1д",
	"22ОП1д" = "22ОП1д",
	// ФГЗиК
	"25БФ1д" = "25БФ1д",
	"25ИО1д" = "25ИО1д",
	"25ИО2д" = "25ИО2д",
	"25ИО3д" = "25ИО3д",
	"25РФ1д" = "25РФ1д",
	"25РФ2д" = "25РФ2д",
	"25РФ3д" = "25РФ3д",
	"25ФО1д" = "25ФО1д",
	"25ФО2д" = "25ФО2д",
	"25ФОЗд" = "25ФОЗд",
	"25ФО4д" = "25ФО4д",
	"25РГФ1д" = "25РГФ1д",
	"25РГФ2д" = "25РГФ2д",
	"24БФ1д" = "24БФ1д",
	"24ИО1д" = "24ИО1д",
	"24РФ1д" = "24РФ1д",
	"24ЛОМК1д" = "24ЛОМК1д",
	"24РГФ1д" = "24РГФ1д",
	"24РГФ2д" = "24РГФ2д",
	"23БФ1д" = "23БФ1д",
	"23ИО1д" = "23ИО1д",
	"23ФО1д" = "23ФО1д",
	"23ЛОМК1д" = "23ЛОМК1д",
	"23РГФ1д" = "23РГФ1д",
	"23РГФ2д" = "23РГФ2д",
	"22БФ1д" = "22БФ1д",
	"22ИОД1д" = "22ИОД1д",
	"22РФ1д" = "22РФ1д",
	"22ЛОМК1д" = "22ЛОМК1д",
	"22РГФ1д" = "22РГФ1д",
	"22РГФ2д" = "22РГФ2д",
	"21ЛОМК1д" = "21ЛОМК1д",
	// ФМиИТ
	"25ИСИТ1д" = "25ИСИТ1д",
	"25МИ1д" = "25МИ1д",
	"25МФ1д" = "25МФ1д",
	"25ПИ1д" = "25ПИ1д",
	"25ПИнж1д" = "25ПИнж1д",
	"25ПМ1д" = "25ПМ1д",
	"25УИР1д" = "25УИР1д",
	"24ИСИТ1д" = "24ИСИТ1д",
	"24КБ1д" = "24КБ1д",
	"24МИ1д" = "24МИ1д",
	"24МФ1д" = "24МФ1д",
	"24ПИ1д" = "24ПИ1д",
	"24ПИнж1д" = "24ПИнж1д",
	"24УИР1д" = "24УИР1д",
	"23ИСИТ1д" = "23ИСИТ1д",
	"23ПИ1д" = "23ПИ1д",
	"23ПИнж1д" = "23ПИнж1д",
	"23ПМ1д" = "23ПМ1д",
	"23УИР1д" = "23УИР1д",
	"23ФИЗ1д" = "23ФИЗ1д",
	"23ФМО1д" = "23ФМО1д",
	"22ИСИТ1д" = "22ИСИТ1д",
	"22МИ1д" = "22МИ1д",
	"22ПИ_ВЕБ1д" = "22ПИ_ВЕБ1д",
	"22ПИ_ПОКС1д" = "22ПИ_ПОКС1д",
	"22ПМ1д" = "22ПМ1д",
	"22ПОИТ1д" = "22ПОИТ1д",
	"22УИР1д" = "22УИР1д",
	"22ФИЗ1д" = "22ФИЗ1д",
	// ФСПиП
	"25Пс1д" = "25Пс1д",
	"25СПиПО1д" = "25СПиПО1д",
	"25СПиПО2l" = "25СПиПО2l",
	"24Пс1д" = "24Пс1д",
	"24СПиПО1д" = "24СПиПО1д",
	"24СПиПО2д" = "24СПиПО2д",
	"23Пс1д" = "23Пс1д",
	"23СПиПО1д" = "23СПиПО1д",
	"22Пс1д" = "22Пс1д",
	"22СП1д" = "22СП1д",
	// ФФКиС
	"25ОФК1д" = "25ОФК1д",
	"25ОФК2д" = "25ОФК2д",
	"25ОФК3д" = "25ОФК3д",
	"25ОФК4д" = "25ОФК4д",
	"25ТД1д" = "25ТД1д",
	"24ОФК1д" = "24ОФК1д",
	"24ОФК2д" = "24ОФК2д",
	"24ОФК3д" = "24ОФК3д",
	"24ТД1д" = "24ТД1д",
	"23ОФК1д" = "23ОФК1д",
	"23ОФК2д" = "23ОФК2д",
	"23ОФК3д" = "23ОФК3д",
	"23TД1д" = "23TД1д",
	"22СПД1д" = "22СПД1д",
	"22ФК1д" = "22ФК1д",
	"22ФК2д" = "22ФК2д",
	// ФХБиГН
	"25-Био" = "25-Био",
	"25-БХ1" = "25-БХ1",
	"25-БХ2т" = "25-БХ2т",
	"25-БХ3т" = "25-БХ3т",
	"25-Гео1т" = "25-Гео1т",
	"24-БХ" = "24-БХ",
	"24-МкБ" = "24-МкБ",
	"24-Эко" = "24-Эко",
	"23-БХ" = "23-БХ",
	"23-МкБ" = "23-МкБ",
	"23-Эко" = "23-Эко",
	"22-БХ" = "22-БХ",
	"22-БЭ" = "22-БЭ",
	// ХГФ
	"25Дс1д" = "25Дс1д",
	"25ХОИ3ОТО1д" = "25ХОИ3ОТО1д",
	"25ХОКГ1д" = "25ХОКГ1д",
	"24ДПИ1д" = "24ДПИ1д",
	"24Дс1д" = "24Дс1д",
	"24ХОИЗОТО1д" = "24ХОИЗОТО1д",
	"24ХОКГ1д" = "24ХОКГ1д",
	"23Дс1д" = "23Дс1д",
	"23ХОИЗОКГ1д" = "23ХОИЗОКГ1д",
	"23ХОИ3ОТО1д" = "23ХОИ3ОТО1д",
	"22Дс1д" = "22Дс1д",
	"22ИЗОЧП1д" = "22ИЗОЧП1д",
	"21ДПИд1д" = "21ДПИд1д",
	"21ДПИк1д" = "21ДПИк1д",
	"21Дс1д" = "21Дс1д",
	// ЮФ
	"25Мп1д" = "25Мп1д",
	"25Пр1д" = "25Пр1д",
	"25Пр2д" = "25Пр2д",
	"25Пр3д" = "25Пр3д",
	"24Мп1д" = "24Мп1д",
	"24Пр1д" = "24Пр1д",
	"24Пр2д" = "24Пр2д",
	"24Пр3д" = "24Пр3д",
	"23Мп1д" = "23Мп1д",
	"23Пр1д" = "23Пр1д",
	"23Пр2д" = "23Пр2д",
	"22Мп1д" = "22Мп1д",
	"22Пр1д" = "22Пр1д",
	"22Пр2д" = "22Пр2д",
}

export interface UserAttributes {
	id: number;
	login: string;
	email: string;
	password: string;
	role: Role;
	firstName: string;
	lastName: string;
	middleName: string;
	faculty: Faculty | null;
	course: number | null;
	group: Group | null;
	avatar: string | null;
	birthDate: Date | null;
	gender: Gender | null;
}

export interface UserCreateAttributes
	extends Optional<
		UserAttributes,
		"id" | "faculty" | "course" | "group" | "avatar" | "birthDate" | "gender"
	> {}

interface User extends UserAttributes {}

class User
	extends Model<UserAttributes, UserCreateAttributes>
	implements UserAttributes
{
	public async comparePassword(password: string) {
		return bcrypt.compare(password, this.getDataValue("password"));
	}

	public toSafeObject(): Omit<UserAttributes, "password"> {
		const { password, ...userWithoutPassword } = this.get();
		return userWithoutPassword;
	}
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		login: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				len: [6, 255],
			},
		},
		role: {
			type: DataTypes.ENUM(...Object.values(Role)),
			allowNull: false,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		middleName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		faculty: {
			type: DataTypes.ENUM(...Object.values(Faculty)),
			allowNull: true,
		},
		course: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				notEmpty: true,
				isIn: [[1, 2, 3, 4, 5]],
			},
		},
		group: {
			type: DataTypes.ENUM(...Object.values(Group)),
			allowNull: true,
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: { notEmpty: true, isUrl: true },
		},
		birthDate: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			validate: {
				notEmpty: true,
				isDate: true,
				isBefore: new Date().toISOString().split("T")[0],
			},
		},
		gender: {
			type: DataTypes.ENUM(...Object.values(Gender)),
			allowNull: true,
		},
	},
	{
		sequelize,
		modelName: "User",
		tableName: "users",
		timestamps: false,
		underscored: true,
		hooks: {
			beforeCreate: async (user: User) => {
				const password = user.getDataValue("password");

				if (password) {
					const hashedPassword = await bcrypt.hash(password, 12);
					user.setDataValue("password", hashedPassword);
				}
			},
			beforeUpdate: async (user: User) => {
				if (user.changed("password")) {
					const password = user.getDataValue("password");
					const hashedPassword = await bcrypt.hash(password, 12);
					user.setDataValue("password", hashedPassword);
				}
			},
		},
	}
);

export default User;
