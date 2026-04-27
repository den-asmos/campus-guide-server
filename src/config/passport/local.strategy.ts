import { Strategy as LocalStrategy } from "passport-local";
import { UserRepository } from "../../repositories/user.repository";

const INVALID_CREDENTIALS_MESSAGE = "Неверный логин или пароль";

export const buildLocalStrategy = (
	userRepository: UserRepository,
): LocalStrategy => {
	return new LocalStrategy(
		{
			usernameField: "login",
			passwordField: "password",
		},
		async (login, password, done) => {
			try {
				const user = await userRepository.findByLogin(login);
				if (!user) {
					return done(null, false, { message: INVALID_CREDENTIALS_MESSAGE });
				}

				const isPasswordValid = await user.comparePassword(password);
				if (!isPasswordValid) {
					return done(null, false, { message: INVALID_CREDENTIALS_MESSAGE });
				}

				return done(null, user.toSafeObject());
			} catch (error) {
				return done(error);
			}
		},
	);
};
