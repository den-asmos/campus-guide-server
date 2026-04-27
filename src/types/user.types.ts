import { User } from "../models/user.model";

export type SafeUser = ReturnType<User["toSafeObject"]>;

export interface UpdateUser {
	role?: User["role"];
	faculty?: User["faculty"];
	course?: User["course"];
	group?: User["group"];
	avatar?: User["avatar"];
	birthDate?: User["birthDate"];
	gender?: User["gender"];
}
