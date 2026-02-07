let bookingCounter = 10000;

/**
 * Generates a unique booking ID
 */
export function generateBookingId(): string {
  bookingCounter++;
  return `BK-${bookingCounter}`;
}
