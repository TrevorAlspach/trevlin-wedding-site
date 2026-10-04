import { EntitySchema } from "typeorm";

export interface FamilyGuest {
  familyId: string;
  guestId: number;
}

export const FamilyGuestSchema = new EntitySchema<FamilyGuest>({
  name: "FamilyGuest",
  tableName: "family_guests",
  schema: "dbo",
  columns: {
    // One family per guest; a family can have many guest members.
    guestId: { name: "guest_id", type: "int", primary: true },
    familyId: { name: "family_id", type: "varchar", length: 1000 },
  },
  indices: [{ name: "IDX_family_guests_family_id", columns: ["familyId"] }],
  foreignKeys: [
    {
      name: "FK_family_guests_family",
      target: "Family",
      columnNames: ["familyId"],
      referencedColumnNames: ["familyId"],
    },
    {
      name: "FK_family_guests_guest",
      target: "Guest",
      columnNames: ["guestId"],
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
    },
  ],
});
