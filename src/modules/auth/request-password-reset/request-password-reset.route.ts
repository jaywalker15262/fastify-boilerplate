import env from '@/config/env';
import sql from '@/shared/db/postgres';
import { resend } from '@/shared/email/resend';
import { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';

export default async function requestPasswordResetRoute(
  server: FastifyInstance,
) {
  server.post(
    '/',
    {
      config: {
        rateLimit: {
          max: 4,
          timeWindow: '30m',
        },
      },
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body as { email: string };

      const [user] =
        await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

      if (!user) {
        // for privacy, still return success
        return reply.send({ success: true });
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt})
        ON CONFLICT (user_id) DO UPDATE
        SET token = EXCLUDED.token, expires_at = EXCLUDED.expires_at
      `;

      const resetUrl = `${env.appUrl}/reset-password?token=${token}`;

      await resend.emails.send({
        from: 'noreply@instaal.dev',
        to: email,
        subject: 'Reset your Instaal password',
        html: `<p>Someone requested a password reset. <a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>`,
      });

      return reply.send({ success: true });
    },
  );
}
