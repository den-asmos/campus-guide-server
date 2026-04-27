import jwt from "jsonwebtoken";
import { jwtConfig, JwtPayload } from "../config/jwt.config";
import { AppError } from "../errors/app-error";

export class TokenService {
	generate(payload: JwtPayload): string {
		return jwt.sign(payload, jwtConfig.secret, {
			expiresIn: jwtConfig.expiresIn,
			issuer: jwtConfig.issuer,
		});
	}

	verify(token: string): JwtPayload {
		try {
			return jwt.verify(token, jwtConfig.secret, {
				issuer: jwtConfig.issuer,
			}) as JwtPayload;
		} catch {
			throw new AppError(
				"Некорректный токен или истёк его срок действия",
				401,
				"INVALID_TOKEN",
			);
		}
	}
}
