import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Reset token expiry: 1 hour from now (configurable via PASSWORD_RESET_TOKEN_EXPIRY, e.g. "1h", "30m"). */
function getResetTokenExpiresAt(): Date {
  const expiresAt = new Date();
  const envValue = process.env.PASSWORD_RESET_TOKEN_EXPIRY || '1h';
  const match = envValue.match(/^(\d+)([mhd]?)$/);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2] || 'h';

    if (unit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else if (unit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else {
      expiresAt.setDate(expiresAt.getDate() + value);
    }
  } else {
    expiresAt.setHours(expiresAt.getHours() + 1);
  }
  return expiresAt;
}

/**
 * Create a password reset token for the given user. Stores hashed token in DB.
 * Returns the plain token to include in the reset link (e.g. query param).
 */
export async function createResetToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const id = uuidv4();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = getResetTokenExpiresAt();

  await pool.execute(
    'INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, tokenHash, expiresAt]
  );

  return { token, expiresAt };
}

interface TokenRow extends RowDataPacket {
  user_id: string;
  expires_at: Date;
}

/**
 * Find a valid (non-expired) reset token. Returns userId or null. Deletes token if expired.
 */
export async function findValidResetToken(token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  const [rows] = await pool.execute<TokenRow[]>(
    'SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = ?',
    [tokenHash]
  );
  if (!rows.length) return null;
  const row = rows[0];
  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await consumeResetToken(token);
    return null;
  }
  return row.user_id;
}

/** Delete the reset token (after successful password reset or when expired). */
export async function consumeResetToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await pool.execute('DELETE FROM password_reset_tokens WHERE token_hash = ?', [tokenHash]);
}
