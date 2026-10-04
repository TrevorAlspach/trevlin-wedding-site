import type { Family } from "./db/family.js";
import type { Guest } from "./db/guest.js";
import {
  MAX_DIETARY_NOTES_LENGTH,
  MAX_RSVP_GUESTS,
  MAX_SONG_REQUEST_LENGTH,
  type RsvpDetails,
  type RsvpGuestResponse,
  type RsvpSubmission,
} from "../shared/rsvp.js";

export class RsvpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export interface RsvpReader {
  findGuestsByEmail(email: string): Promise<Guest[]>;
  findFamily(familyId: string): Promise<Family | null>;
  findMembers(familyId: string): Promise<Guest[]>;
}

export interface RsvpWriter extends RsvpReader {
  saveResponse(familyId: string, response: RsvpGuestResponse, respondedAt: Date): Promise<void>;
}

export interface RsvpStore {
  // The adapter keeps authorization reads and all guest writes in one transaction.
  transaction<T>(work: (store: RsvpWriter) => Promise<T>): Promise<T>;
}

export interface RsvpService {
  load(email: string, name: string | null): Promise<RsvpDetails>;
  submit(email: string, body: unknown): Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRsvpSubmission(body: unknown): RsvpSubmission {
  if (!isRecord(body) || Object.keys(body).some((key) => key !== "guests") ||
      !Array.isArray(body.guests) || body.guests.length < 1 || body.guests.length > MAX_RSVP_GUESTS) {
    throw new RsvpError(400, "Please provide responses for the selected guests.");
  }
  const ids = new Set<number>();
  const allowedKeys = new Set([
    "guestId", "attending", "teaCeremonyRsvp", "rehearsalDinnerRsvp", "songRequests", "dietaryNotes",
  ]);
  const guests = body.guests.map((value): RsvpGuestResponse => {
    if (!isRecord(value) || Object.keys(value).some((key) => !allowedKeys.has(key)) ||
        typeof value.guestId !== "number" || !Number.isSafeInteger(value.guestId) || value.guestId < 1 ||
        ids.has(value.guestId) || typeof value.attending !== "boolean" ||
        !(value.teaCeremonyRsvp === null || typeof value.teaCeremonyRsvp === "boolean") ||
        !(value.rehearsalDinnerRsvp === null || typeof value.rehearsalDinnerRsvp === "boolean") ||
        typeof value.songRequests !== "string" || value.songRequests.length > MAX_SONG_REQUEST_LENGTH ||
        typeof value.dietaryNotes !== "string" || value.dietaryNotes.length > MAX_DIETARY_NOTES_LENGTH) {
      throw new RsvpError(400, "Please check the attendance answers and notes for each guest.");
    }
    ids.add(value.guestId);
    return {
      guestId: value.guestId,
      attending: value.attending,
      teaCeremonyRsvp: value.teaCeremonyRsvp,
      rehearsalDinnerRsvp: value.rehearsalDinnerRsvp,
      songRequests: value.songRequests.trim(),
      dietaryNotes: value.dietaryNotes.trim(),
    };
  });
  return { guests };
}

// Both reads and writes resolve the household from the verified SSO email.
// Client-supplied family IDs or email addresses never establish authorization.
export async function loadRsvpFamily(reader: RsvpReader, email: string) {
  const matches = await reader.findGuestsByEmail(email.trim().toLowerCase());
  if (matches.length === 0) {
    throw new RsvpError(404, "We couldn't find an invitation for your sign-in email. Please contact us for help.");
  }
  if (matches.length !== 1) {
    throw new RsvpError(409, "Your email matches more than one guest. Please contact us to confirm your invitation.");
  }
  const guest = matches[0]!;
  if (!guest.family) {
    throw new RsvpError(409, "Your family invitation isn't ready yet. Please contact us for help.");
  }
  const family = await reader.findFamily(guest.family);
  const members = await reader.findMembers(guest.family);
  if (!family || !members.some((member) => member.id === guest.id) ||
      members.some((member) => member.family !== family.familyId)) {
    throw new RsvpError(409, "Your family invitation needs to be updated. Please contact us for help.");
  }
  return { guest, family, members };
}

export function createRsvpService(store: RsvpStore): RsvpService {
  return {
    load: (email, name) => store.transaction(async (reader) => {
      const { guest, family, members } = await loadRsvpFamily(reader, email);
      return {
        identity: { email, name },
        guestId: guest.id,
        invitations: {
          teaCeremony: family.teaCeremonyInvited,
          rehearsalDinner: family.rehearsalDinnerInvited,
        },
        guests: members.map((member) => ({
          id: member.id,
          name: member.name,
          // Legacy false values have no record of whether a response was made.
          attending: member.rsvpRespondedAt || member.rsvp ? member.rsvp : null,
          teaCeremonyRsvp: family.teaCeremonyInvited ? member.teaCeremonyRsvp : null,
          rehearsalDinnerRsvp: family.rehearsalDinnerInvited ? member.rehearsalDinnerRsvp : null,
          songRequests: member.songRequests ?? "",
          dietaryNotes: member.dietaryNotes ?? "",
        })),
      };
    }),
    async submit(email, body) {
      const submission = parseRsvpSubmission(body);
      await store.transaction(async (writer) => {
        const { guest, family, members } = await loadRsvpFamily(writer, email);
        const memberIds = new Set(members.map((member) => member.id));
        if (!submission.guests.some((response) => response.guestId === guest.id)) {
          throw new RsvpError(400, "Please include your own RSVP with your family's responses.");
        }
        // Validate the entire submission before writing any individual response.
        for (const response of submission.guests) {
          if (!memberIds.has(response.guestId)) {
            throw new RsvpError(403, "You can only RSVP for members of your family.");
          }
          for (const [invited, answer] of [
            [family.teaCeremonyInvited, response.teaCeremonyRsvp],
            [family.rehearsalDinnerInvited, response.rehearsalDinnerRsvp],
          ]) {
            if (invited ? typeof answer !== "boolean" : answer !== null) {
              throw new RsvpError(400, "Please answer the events on your current invitation. Reload the page if it has changed.");
            }
          }
        }
        const respondedAt = new Date();
        for (const response of submission.guests) {
          await writer.saveResponse(family.familyId, response, respondedAt);
        }
      });
    },
  };
}
