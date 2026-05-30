import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export interface EmailAttachment {
  filename: string;
  content: string;
  encoding?: string;
}

function getTransporter(): Transporter {
  if (!transporter) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new Error(
        "EMAIL_USER and EMAIL_PASS must be set in environment variables."
      );
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  attachments: EmailAttachment[] = []
): Promise<void> {
  const transport = getTransporter();

  let from;

  if (attachments.length > 0) {
    from = `"Vishnu Priya Brass Products" <${process.env.EMAIL_USER}>`;
  } else {
    from = `"Daily News Bot 📰" <${process.env.EMAIL_USER}>`;
  }

  await transport.sendMail({
    from,
    to,
    subject,
    html: htmlBody,
    attachments,
  });
}
