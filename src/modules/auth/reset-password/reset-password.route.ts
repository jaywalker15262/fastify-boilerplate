import sql from '@/shared/db/postgres';
import { hash } from 'bcrypt';
import { FastifyInstance, FastifyRequest } from 'fastify';

type ResetBody = {
  token: string;
  newPassword: string;
};

export default async function resetPasswordRoute(server: FastifyInstance) {
  server.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: ResetBody }>, reply) => {
      const { token, newPassword } = request.body;

      const [row] = await sql`
        SELECT user_id, expires_at
        FROM password_reset_tokens
        WHERE token = ${token}
      `;

      if (!row || new Date(row.expires_at) < new Date()) {
        return reply.status(400).send({ error: 'Invalid or expired token' });
      }

      const hashed = await hash(newPassword, 10); // 10 salt rounds

      await sql`
        UPDATE users
        SET password = ${hashed}
        WHERE id = ${row.user_id}
      `;

      await sql`
        DELETE FROM password_reset_tokens
        WHERE token = ${token}
      `;

      return reply.send({ success: true, message: 'Password has been reset' });
    },
  );
}
