import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const id = uuidv4();
  const token = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  
  // If REFRESH_TOKEN_EXPIRY_DAYS has a time suffix (m, h, d), parse accordingly
  const envValue = process.env.REFRESH_TOKEN_EXPIRY_DAYS || "2m";
  const match = envValue.match(/^(\d+)([mhd]?)$/);
  
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2] || 'd'; // default to days
    
    if (unit === 'm') {
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
    } else if (unit === 'h') {
      expiresAt.setHours(expiresAt.getHours() + value);
    } else {
      expiresAt.setDate(expiresAt.getDate() + value);
    }
  } else {
    // Fallback to 7 days if invalid format
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  await pool.execute(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [id, userId, tokenHash, expiresAt]
  );

  return { token, expiresAt };
}

interface TokenRow extends RowDataPacket {
  user_id: string;
  expires_at: Date;
}

export async function findRefreshToken(token: string): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(token);
  const [rows] = await pool.execute<TokenRow[]>(
    'SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = ?',
    [tokenHash]
  );
  if (!rows.length) return null;
  const row = rows[0];
  if (new Date(row.expires_at) < new Date()) {
    await deleteRefreshToken(token);
    return null;
  }
  return { userId: row.user_id };
}

export async function deleteRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await pool.execute('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash]);
}

export async function deleteRefreshTokensForUser(userId: string): Promise<void> {
  await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}
