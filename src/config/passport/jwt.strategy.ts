import { JwtPayload } from "jsonwebtoken";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { UserRepository } from "../../repositories/user.repository";
import { jwtConfig } from "../jwt.config";

export const buildJwtStrategy = (
	userRepository: UserRepository,
): JwtStrategy => {
	return new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: jwtConfig.secret,
			issuer: jwtConfig.issuer,
		},
		async (payload: JwtPayload, done) => {
			try {
				if (!payload.id || typeof payload.id !== "number") {
					return done(null, false, { message: "Некорректный токен" });
				}

				const user = await userRepository.findById(payload.id);
				if (!user) {
					return done(null, false, { message: "Пользователь не найден" });
				}

				return done(null, user.toSafeObject());
			} catch (error) {
				return done(error);
			}
		},
	);
};
