import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'chibibadminton_user_id';

export const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

// This can be used for testing or if a user wants to "reset" their identity
export const clearUserId = (): void => {
  localStorage.removeItem(USER_ID_KEY);
};
