import database from "./data-source.js";
import { GuestSchema } from "./guest.js";

// Uses the shared pool initialized during server startup.
// Inside a transaction, use its manager.getRepository(GuestSchema) instead.
export const guestRepository = database.getRepository(GuestSchema);
