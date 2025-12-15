import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { UserRepository } from "../repositories/user";
import { jwtConfig, JwtPayload } from "./jwt";

const userRepository = new UserRepository();

passport.use(
	new LocalStrategy(
		{
			usernameField: "login",
			passwordField: "password",
		},
		async (login, password, done) => {
			try {
				const user = await userRepository.findByLogin(login);

				if (!user) {
					return done(null, false, { message: "Неверный логин или пароль" });
				}

				const isPasswordValid = await user.comparePassword(password);

				if (!isPasswordValid) {
					return done(null, false, { message: "Неверный логин или пароль" });
				}

				return done(null, user.toSafeObject());
			} catch (error) {
				return done(error);
			}
		}
	)
);

passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: jwtConfig.secret,
			issuer: jwtConfig.issuer,
		},
		async (payload: JwtPayload, done) => {
			try {
				const user = await userRepository.findById(payload.id);

				if (!user) {
					return done(null, false, { message: "Пользователь не найден" });
				}

				return done(null, user.toSafeObject());
			} catch (error) {
				return done(error);
			}
		}
	)
);

export default passport;
