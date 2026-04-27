import { Attributes } from "sequelize";
import type { User } from "../models/user.model";
import { Multer } from "multer";

declare module "express-serve-static-core" {
	namespace Express {
		interface Request {
			validatedQuery: Record<string, unknown>;
			validatedParams: Record<string, unknown>;
			user?: Attributes<User>;
			file?: Multer.File;
		}
	}
}
