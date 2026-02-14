import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import type { User } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import pool from '../db/connection.js';

interface UserRow extends RowDataPacket {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password: string;
  role: string;
  default_payment_method: string | null;
  reward_points: number;
  total_points_earned: number;
  total_points_spent: number;
  member_since: Date | string;
  avatar: string | null;
  is_blocked?: boolean;
}

function rowToUser(row: UserRow): User {
  const memberSince = row.member_since instanceof Date
    ? row.member_since.toISOString().slice(0, 10)
    : String(row.member_since).slice(0, 10);
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone ?? undefined,
    password: row.password,
    role: row.role as User['role'],
    rewardPoints: row.reward_points,
    totalPointsEarned: row.total_points_earned,
    totalPointsSpent: row.total_points_spent,
    memberSince,
    avatar: row.avatar ?? undefined,
    isBlocked: Boolean(row.is_blocked),
  };
}

export const getUserById = async (userId: string): Promise<User | null> => {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  if (!rows.length) return null;
  return rowToUser(rows[0]);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
    [email]
  );
  if (!rows.length) return null;
  return rowToUser(rows[0]);
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const id = uuidv4();
  const role = userData.role ?? 'user';
  const memberSince = userData.memberSince?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  await pool.execute(
    `INSERT INTO users (
      id, first_name, last_name, email, phone, password, role,
      reward_points, total_points_earned, total_points_spent, member_since
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.phone ?? null,
      userData.password!,
      role,
      userData.rewardPoints ?? 0,
      userData.totalPointsEarned ?? 0,
      userData.totalPointsSpent ?? 0,
      memberSince,
    ]
  );
  const user = await getUserById(id);
  if (!user) throw createError('Failed to create user', 500);
  return user;
};

export const getAllUsersCount = async (): Promise<number> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM users'
  );
  return Number(rows[0]?.count ?? 0);
};

export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, first_name, last_name, email, phone, role, reward_points, total_points_earned, total_points_spent, member_since, avatar, is_blocked, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
  return rows.map((row) => {
    const memberSince = row.member_since instanceof Date
      ? row.member_since.toISOString().slice(0, 10)
      : String(row.member_since).slice(0, 10);
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone ?? undefined,
      role: row.role as User['role'],
      rewardPoints: row.reward_points,
      totalPointsEarned: row.total_points_earned,
      totalPointsSpent: row.total_points_spent,
      memberSince,
      avatar: row.avatar ?? undefined,
      isBlocked: Boolean(row.is_blocked),
    };
  });
};

export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'password'>>
): Promise<User | null> => {
  const user = await getUserById(userId);
  if (!user) return null;

  const fields: string[] = [];
  const values: unknown[] = [];
  if (updates.firstName !== undefined) {
    fields.push('first_name = ?');
    values.push(updates.firstName);
  }
  if (updates.lastName !== undefined) {
    fields.push('last_name = ?');
    values.push(updates.lastName);
  }
  if (updates.phone !== undefined) {
    fields.push('phone = ?');
    values.push(updates.phone);
  }
  if (updates.role !== undefined) {
    fields.push('role = ?');
    values.push(updates.role);
  }
  if (updates.rewardPoints !== undefined) {
    fields.push('reward_points = ?');
    values.push(updates.rewardPoints);
  }
  if (updates.totalPointsEarned !== undefined) {
    fields.push('total_points_earned = ?');
    values.push(updates.totalPointsEarned);
  }
  if (updates.totalPointsSpent !== undefined) {
    fields.push('total_points_spent = ?');
    values.push(updates.totalPointsSpent);
  }
  if (updates.memberSince !== undefined) {
    fields.push('member_since = ?');
    values.push(updates.memberSince.slice(0, 10));
  }
  if (updates.avatar !== undefined) {
    fields.push('avatar = ?');
    values.push(updates.avatar);
  }
  if (updates.isBlocked !== undefined) {
    fields.push('is_blocked = ?');
    values.push(updates.isBlocked ? 1 : 0);
  }
  if (fields.length === 0) return user;
  values.push(userId);
  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return getUserById(userId);
};

export const updateUserPoints = async (
  userId: string,
  pointsChange: number,
  type: 'earned' | 'spent'
): Promise<User | null> => {
  const user = await getUserById(userId);
  if (!user) return null;

  const rewardPoints = type === 'earned'
    ? user.rewardPoints + pointsChange
    : user.rewardPoints - pointsChange;
  const totalPointsEarned = type === 'earned'
    ? user.totalPointsEarned + pointsChange
    : user.totalPointsEarned;
  const totalPointsSpent = type === 'spent'
    ? user.totalPointsSpent + pointsChange
    : user.totalPointsSpent;

  return updateUser(userId, {
    rewardPoints,
    totalPointsEarned,
    totalPointsSpent,
  });
};

export const updatePassword = async (
  userId: string,
  hashedPassword: string
): Promise<void> => {
  await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
};
