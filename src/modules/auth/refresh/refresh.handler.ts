
import { FastifyReply, FastifyRequest } from 'fastify';
import { verifyRefreshToken, signAccessToken, parseJwtExpires } from '../token';
import env from '@/config/env';

export async function handleRefresh(
  request: FastifyRequest<{ Body: { refreshToken: string } }>,
  reply: FastifyReply
) {
  try {
    console.log('[refresh.handler] body:', request.body);
    const payload = verifyRefreshToken(request.body.refreshToken);
    const accessToken = signAccessToken({ id: payload.id, email: payload.email });

    const expiresIn = parseJwtExpires(env.jwt.expiresIn);

    return reply.send({ accessToken, expiresIn });
  } catch (error) {
    request.log.error(error);
    return reply.status(401).send({ message: 'Invalid refresh token' });
  }
}