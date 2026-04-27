import dotenv from "dotenv";
import ms from "ms";
import { Role } from "../models/user.model";

dotenv.config();

export const jwtConfig = {
	secret: process.env.JWT_SECRET || "docendo_discimus",
	expiresIn: "7d" as ms.StringValue,
	issuer: process.env.JWT_ISSUER || "campus_guide",
};

export interface JwtPayload {
	id: number;
	login: string;
	email: string;
	role: Role;
}
