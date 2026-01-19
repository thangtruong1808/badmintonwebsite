import type { User } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';

// In-memory storage (replace with database later)
let users: User[] = [
  {
    id: 'user-123',
    name: 'Sample User',
    email: 'john.doe@example.com',
    phone: '+61 400 123 456',
    password: '$2a$10$r5YkZLxK5Hh8JQyG8FqZ5OZ5KxKxKxKxKxKxKxKxKxKxKxKxKxK', // password: "password123"
    rewardPoints: 250,
    totalPointsEarned: 500,
    totalPointsSpent: 250,
    memberSince: '2024-01-15',
  },
];

export const getUserById = async (userId: string): Promise<User | null> => {
  const user = users.find((u) => u.id === userId);
  return user || null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'password'>>
): Promise<User | null> => {
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  return users[userIndex];
};

export const updateUserPoints = async (
  userId: string,
  pointsChange: number,
  type: 'earned' | 'spent'
): Promise<User | null> => {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  if (type === 'earned') {
    user.rewardPoints += pointsChange;
    user.totalPointsEarned += pointsChange;
  } else {
    user.rewardPoints -= pointsChange;
    user.totalPointsSpent += pointsChange;
  }

  return await updateUser(userId, {
    rewardPoints: user.rewardPoints,
    totalPointsEarned: user.totalPointsEarned,
    totalPointsSpent: user.totalPointsSpent,
  });
};
