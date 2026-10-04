import { EntitySchema } from "typeorm";

export interface Guest {
  id: number;
  name: string;
  email: string;
  address: string | null;
  rsvp: boolean;
  teaCeremonyInvited: boolean;
  rehearsalDinnerInvited: boolean;
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
    teaCeremonyInvited: {
      name: "tea_ceremony_invited",
      type: Boolean,
      default: false,
    },
    rehearsalDinnerInvited: {
      name: "rehearsal_dinner_invited",
      type: Boolean,
      default: false,
    },
  },
});
