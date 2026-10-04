export const MAX_SONG_REQUEST_LENGTH = 1000;
export const MAX_DIETARY_NOTES_LENGTH = 2000;
export const MAX_RSVP_GUESTS = 100;

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
}
