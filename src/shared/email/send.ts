// src/shared/send.ts
import { resend } from './resend';

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/api/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'noreply@yourapp.com',
    to,
    subject: 'Verify your email',
    html: `<p>Please <a href="${verifyUrl}">verify your email</a> to activate your account.</p>`,
  });
}
