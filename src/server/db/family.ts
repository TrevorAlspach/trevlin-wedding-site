import { EntitySchema } from "typeorm";

export interface Family {
  familyId: string;
  teaCeremonyInvited: boolean;
  rehearsalDinnerInvited: boolean;
}

export const FamilySchema = new EntitySchema<Family>({
  name: "Family",
  tableName: "families",
  schema: "dbo",
  columns: {
    // Azure SQL limits actual primary/foreign key values to 900 bytes.
    familyId: { name: "family_id", type: "varchar", length: 1000, primary: true },
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
