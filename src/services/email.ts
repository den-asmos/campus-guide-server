import nodemailer, { Transporter } from "nodemailer";
import { emailConfig, getEmailOptions } from "../config/email";

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  sendPasswordResetCode = async (email: string, code: string) => {
    const emailOptions = getEmailOptions(email, code);
    try {
      await this.transporter.sendMail(emailOptions);
      return true;
    } catch (error) {
      console.error(error);
			throw new Error("Ошибка при отправке письма");
    }
  }
}