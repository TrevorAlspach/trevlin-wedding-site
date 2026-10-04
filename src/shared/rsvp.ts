export const MAX_SONG_REQUEST_LENGTH = 1000;
export const MAX_DIETARY_NOTES_LENGTH = 2000;
export const MAX_GUEST_NAME_LENGTH = 200;
export const MAX_GUEST_EMAIL_LENGTH = 320;

export interface RsvpAdminGuest {
  id: number;
  name: string;
  email: string;
}

export interface RsvpGuest {
  id: number;
  name: string;
  attending: boolean | null;
  teaCeremonyRsvp: boolean | null;
  rehearsalDinnerRsvp: boolean | null;
  songRequests: string;
  dietaryNotes: string;
}

export interface RsvpDetails {
  identity: { name: string | null; email: string };
  guestId: number;
  invitations: { teaCeremony: boolean; rehearsalDinner: boolean };
  guests: RsvpGuest[];
}

export interface RsvpGuestResponse {
  guestId: number;
  attending: boolean;
  teaCeremonyRsvp: boolean | null;
  rehearsalDinnerRsvp: boolean | null;
  songRequests: string;
  dietaryNotes: string;
}

export interface RsvpSubmission {
  guests: RsvpGuestResponse[];
  additionalGuests?: RsvpAdditionalGuest[];
}

export interface RsvpAdditionalGuest extends Omit<RsvpGuestResponse, "guestId"> {
  additionId: string;
  name: string;
  email: string;
}

export interface RsvpSaveResult {
  addedGuests: { additionId: string; guestId: number }[];
}
