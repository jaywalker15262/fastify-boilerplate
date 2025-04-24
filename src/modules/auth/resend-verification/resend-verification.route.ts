// src/modules/auth/resend-verification/resend-verification.route.ts
import env from '@/config/env';
import sql from '@/shared/db/postgres';
import { resend } from '@/shared/email/resend';
import { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';

export default async function resendVerificationRoute(server: FastifyInstance) {
  server.post(
    '/',
    {
      config: {
        rateLimit: {
          max: 4,
          timeWindow: '30m',
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body as { email: string };

      const [user] =
        await sql`SELECT id, "isVerified" FROM users WHERE email = ${email} LIMIT 1`;

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      if (user.isVerified) {
        return reply.status(400).send({ error: 'Email already verified' });
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await sql`
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt})
        ON CONFLICT (user_id) DO UPDATE
        SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at
      `;

      const verifyUrl = `${env.appUrl}/api/auth/verify-email?token=${token}`;

      await resend.emails.send({
        from: 'noreply@instaal.dev',
        to: email,
        subject: 'Verify your email',
        html: `<p>Please <a href="${verifyUrl}">verify your email</a> to activate your account.</p>`,
      });

      return reply.send({ success: true });
    },
  );
}
