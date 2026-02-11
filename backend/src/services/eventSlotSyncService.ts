import pool from '../db/connection.js';

/** Slot identity used to find generated events (category=regular, recurring). */
export interface PlaySlotIdentity {
  dayOfWeek: string;
  time: string;
  location: string;
  title: string;
}

/** New slot data to apply to events (for update). */
export interface PlaySlotEventData {
  dayOfWeek: string;
  time: string;
  location: string;
  title: string;
  description?: string | null;
  maxCapacity: number;
  price: number;
  imageUrl?: string | null;
}

/**
 * Update all events that were generated from a play slot (match by old identity).
 * Used when admin edits a play slot so the calendar shows the new details.
 */
export const updateEventsForPlaySlot = async (
  oldSlot: PlaySlotIdentity,
  newSlot: PlaySlotEventData
): Promise<number> => {
  const [result] = await pool.execute(
    `UPDATE events
     SET title = ?, time = ?, day_of_week = ?, location = ?, description = ?, max_capacity = ?, price = ?, image_url = ?
     WHERE category = 'regular' AND recurring = TRUE
       AND day_of_week = ? AND time = ? AND location = ? AND title = ?`,
    [
      newSlot.title,
      newSlot.time,
      newSlot.dayOfWeek,
      newSlot.location,
      newSlot.description ?? '',
      newSlot.maxCapacity,
      newSlot.price ?? null,
      newSlot.imageUrl ?? null,
      oldSlot.dayOfWeek,
      oldSlot.time,
      oldSlot.location,
      oldSlot.title,
    ]
  );
  return Number((result as { affectedRows?: number }).affectedRows ?? 0);
};

/**
 * Delete all events that were generated from a play slot (match by identity).
 * Used when admin deletes a play slot so those sessions no longer appear on the play page.
 */
export const deleteEventsForPlaySlot = async (slot: PlaySlotIdentity): Promise<number> => {
  const [result] = await pool.execute(
    `DELETE FROM events
     WHERE category = 'regular' AND recurring = TRUE
       AND day_of_week = ? AND time = ? AND location = ? AND title = ?`,
    [slot.dayOfWeek, slot.time, slot.location, slot.title]
  );
  return Number((result as { affectedRows?: number }).affectedRows ?? 0);
};
