import sql from '@/shared/db/postgres';
import { FastifyInstance, FastifyRequest } from 'fastify';

type VerifyEmailQuery = {
  token: string;
};

export default async function verifyEmailRoute(server: FastifyInstance) {
  server.get(
    '/',
    async (
      request: FastifyRequest<{ Querystring: VerifyEmailQuery }>,
      reply,
    ) => {
      const { token } = request.query;

      if (!token) {
        return reply.status(400).send({ error: 'Missing token' });
      }

      const [row] = await sql`
      SELECT user_id, expires_at 
      FROM email_verification_tokens 
      WHERE token = ${token}
    `;

      if (!row) {
        return reply.status(400).send({ error: 'Invalid or expired token' });
      }

      if (new Date(row.expires_at) < new Date()) {
        return reply.status(400).send({ error: 'Token expired' });
      }

      await sql`
      UPDATE users 
      SET "isVerified" = true 
      WHERE id = ${row.user_id}
    `;

      await sql`
      DELETE FROM email_verification_tokens 
      WHERE token = ${token}
    `;

      return reply.send({ message: 'Email successfully verified!' });
    },
  );
}
