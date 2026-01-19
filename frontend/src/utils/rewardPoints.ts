// Reward points calculation rules
export const REWARD_POINTS_RULES = {
  REGULAR_SOCIAL: 20, // Points per regular social event attended
  TOURNAMENT: 50, // Points per tournament attended
  BONUS_FIRST_TIME: 50, // Bonus for first event
  BONUS_STREAK: 10, // Bonus for attending 5 events in a row
  POINTS_PER_DOLLAR: 1, // 1 point = $1 for booking
};

export const calculatePointsForEvent = (
  category: "regular" | "tournament"
): number => {
  return category === "regular"
    ? REWARD_POINTS_RULES.REGULAR_SOCIAL
    : REWARD_POINTS_RULES.TOURNAMENT;
};

export const canUsePointsForBooking = (
  eventPrice: number,
  userPoints: number
): boolean => {
  return userPoints >= eventPrice;
};

export const formatPoints = (points: number): string => {
  return points.toLocaleString();
};
