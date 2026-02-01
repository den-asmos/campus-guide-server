import dotenv from "dotenv";

dotenv.config();

export const emailConfig = {
	host: process.env.SMTP_HOST || "smtp.mail.ru",
	port: parseInt(process.env.SMTP_PORT || "465"),
	secure: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASSWORD,
	},
};

export const getEmailOptions = (email: string, code: string) => ({
	from: `"Campus Guide" <${process.env.SMTP_USER}>`,
	to: email,
	subject: "Сброс пароля",
	text: `Здравствуйте!\n\nМы получили запрос на сброс пароля для вашей учетной записи Campus Guide.\nДля завершения процесса сброса пароля используйте следующий код подтверждения:\n\n${code}\n\nЭтот код будет действителен в течение 10 минут.\n\nЕсли вы не отправляли запрос на сброс пароля, пожалуйста, проигнорируйте это письмо.\n\nС уважением,\nКоманда технической поддержки Campus Guide`,
});
