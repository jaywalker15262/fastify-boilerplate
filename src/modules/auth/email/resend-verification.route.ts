import env from '@/config/env';
import sql from '@/shared/db/postgres';
import { resend } from '@/shared/email/resend';
import { FastifyInstance } from 'fastify';
import { randomBytes } from 'node:crypto';

export default async function resendVerificationRoute(server: FastifyInstance) {
  server.post('/resend-verification', async (req, res) => {
    const { email } = req.body as { email: string };

    const [user] =
      await sql`SELECT id, "isVerified" FROM users WHERE email = ${email} LIMIT 1`;

    if (!user) {
      return res.status(400).send({ error: 'No user found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).send({ error: 'Email already verified.' });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `;

    const verifyUrl = `${env.appUrl}/api/verify-email?token=${token}`;

    await resend.emails.send({
      from: 'noreply@instaal.dev',
      to: email,
      subject: 'Verify your email (again)',
      html: `<p>Please verify your email again by clicking <a href="${verifyUrl}">here</a>.</p>`,
    });

    return res.send({ message: 'Verification email sent.' });
  });
}
