// src/routes/reset-password/reset-password-handler.ts
import sql from '@/shared/db/postgres';
import bcrypt from 'bcrypt';

export async function handleResetPassword(token: string, newPassword: string) {
  const [row] = await sql`
    SELECT user_id, expires_at
    FROM password_reset_tokens
    WHERE token = ${token}
  `;
  if (!row || new Date(row.expires_at) < new Date()) {
    throw new Error('InvalidOrExpiredToken');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await sql`
    UPDATE users
    SET password = ${hashed}
    WHERE id = ${row.user_id}
  `;

  await sql`
    DELETE FROM password_reset_tokens
    WHERE token = ${token}
  `;

  return { success: true };
}
