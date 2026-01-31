import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../src/db/connection.js';

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'john.doe@example.com';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'password123';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin';

async function seedAdmin(): Promise<void> {
  const [rows] = await pool.execute<[{ count: number }]>(
    'SELECT COUNT(*) AS count FROM users WHERE LOWER(email) = LOWER(?)',
    [SEED_ADMIN_EMAIL]
  );
  const count = Number((rows as { count: number }[])[0]?.count ?? 0);
  if (count > 0) {
    console.log(`Admin user ${SEED_ADMIN_EMAIL} already exists. Skipping seed.`);
    process.exit(0);
    return;
  }
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
  const memberSince = new Date().toISOString().slice(0, 10);
  await pool.execute(
    `INSERT INTO users (
      id, name, email, phone, password, role,
      reward_points, total_points_earned, total_points_spent, member_since
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      SEED_ADMIN_NAME,
      SEED_ADMIN_EMAIL,
      null,
      hashedPassword,
      'admin',
      0,
      0,
      0,
      memberSince,
    ]
  );
  console.log(`Created admin user: ${SEED_ADMIN_EMAIL} (password: ${SEED_ADMIN_PASSWORD})`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
