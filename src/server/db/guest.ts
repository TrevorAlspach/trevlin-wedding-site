import { EntitySchema } from "typeorm";

export interface Guest {
  id: number;
  name: string;
  email: string;
  address: string | null;
  rsvp: boolean;
  family: string | null;
  teaCeremonyRsvp: boolean | null;
  rehearsalDinnerRsvp: boolean | null;
  rsvpRespondedAt: Date | null;
  songRequests: string | null;
  dietaryNotes: string | null;
}

export const GuestSchema = new EntitySchema<Guest>({
  name: "Guest",
  tableName: "guests",
  schema: "dbo",
  columns: {
    id: { type: "int", primary: true, generated: "increment" },
    name: { type: "nvarchar", length: 200 },
    email: { type: "nvarchar", length: 320 },
    address: { type: "nvarchar", length: 1000, nullable: true },
    rsvp: { type: Boolean, default: false },
    family: { type: "varchar", length: 1000, nullable: true },
    teaCeremonyRsvp: { name: "tea_ceremony_rsvp", type: Boolean, nullable: true },
    rehearsalDinnerRsvp: { name: "rehearsal_dinner_rsvp", type: Boolean, nullable: true },
    rsvpRespondedAt: { name: "rsvp_responded_at", type: "datetime2", nullable: true },
    songRequests: { name: "song_requests", type: "nvarchar", length: 1000, nullable: true },
    dietaryNotes: { name: "dietary_notes", type: "nvarchar", length: 2000, nullable: true },
  },
  foreignKeys: [{
    name: "FK_guests_family",
    target: "Family",
    columnNames: ["family"],
    referencedColumnNames: ["familyId"],
  }],
});
