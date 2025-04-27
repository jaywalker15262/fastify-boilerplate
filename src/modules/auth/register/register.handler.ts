// src/modules/auth/register/register.handler.ts
import { RegisterRequest } from './register.schema';
import env from '@/config/env';
import {
  createUserCommand,
  CreateUserCommandResult,
} from '@/modules/user/commands/create-user/create-user.handler';
import { randomBytes } from 'node:crypto';

type Dependencies = {
  sql: any;
  resend: {
    emails: {
      send: (args: {
        from: string;
        to: string;
        subject: string;
        html: string;
      }) => Promise<any>;
    };
  };
};

export function makeRegisterHandler({ sql, resend }: Dependencies) {
  return async function registerHandler(
    fastify: FastifyRouteInstance,
    payload: RegisterRequest,
  ): Promise<{ id: string }> {
    // Extract the token
    const { recaptchaToken, ...registerData } = payload;
    if (!recaptchaToken) {
      throw fastify.httpErrors.badRequest('Missing reCAPTCHA token');
    }

    // Verify with Google
    const resp = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.recaptchaSecretKey,
          response: recaptchaToken,
        }),
      },
    );
    const { success, score } = (await resp.json()) as {
      success: boolean;
      score: number;
    };

    if (!success || score < 0.5) {
      throw fastify.httpErrors.forbidden('reCAPTCHA verification failed');
    }

    // Create user
    const id = await fastify.commandBus.execute<CreateUserCommandResult>(
      createUserCommand(registerData),
    );

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${id}, ${token}, ${expiresAt})
    `;

    const verifyUrl = `${env.appUrl}/api/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: 'noreply@instaal.dev',
      to: registerData.email,
      subject: 'Verify your email',
      html: `<p>Thanks for signing up! Please <a href="${verifyUrl}">verify your email</a> to activate your account.</p>`,
    });

    return { id };
  };
}
