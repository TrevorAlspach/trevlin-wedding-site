import { Raw, type DataSource, type EntityManager } from "typeorm";
import { FamilySchema } from "./family.js";
import { FamilyGuestSchema } from "./family-guest.js";
import { GuestSchema } from "./guest.js";
import { RsvpError, type RsvpReader, type RsvpStore } from "../rsvp.js";

export function createRsvpReader(manager: EntityManager): RsvpReader {
  return {
    findGuestById: (id) => manager.getRepository(GuestSchema).findOneBy({ id }),
    findGuestsByEmail: (email) => manager.getRepository(GuestSchema).find({
      where: {
        email: Raw((column) => `LOWER(LTRIM(RTRIM(${column}))) = :email`, { email }),
      },
      order: { id: "ASC" },
      take: 2,
    }),
    findFamily: (familyId) => manager.getRepository(FamilySchema).findOneBy({ familyId }),
    findMembers: (familyId) => manager.getRepository(GuestSchema)
      .createQueryBuilder("guest")
      .innerJoin(FamilyGuestSchema.options.name, "membership", "membership.guestId = guest.id")
      .where("membership.familyId = :familyId", { familyId })
      .orderBy("guest.id", "ASC")
      .getMany(),
  };
}

export function createRsvpStore(database: DataSource): RsvpStore {
  return {
    transaction: (work) => database.transaction("SERIALIZABLE", async (manager) => work({
      ...createRsvpReader(manager),
      findGuestByAdditionId: (rsvpAdditionId) => manager.getRepository(GuestSchema).findOneBy({ rsvpAdditionId }),
      async saveAddedGuest(familyId, addition, guestId) {
        const guest = await manager.getRepository(GuestSchema).save({
          ...(guestId === undefined ? {} : { id: guestId }),
          name: addition.name,
          email: addition.email,
          family: familyId,
          rsvpAdditionId: addition.additionId,
        });
        if (guestId === undefined) {
          await manager.getRepository(FamilyGuestSchema).insert({ familyId, guestId: guest.id });
        }
        return guest.id;
      },
      async saveResponse(familyId, response, respondedAt) {
        const result = await manager.getRepository(GuestSchema).update(
          { id: response.guestId, family: familyId },
          {
            rsvp: response.attending,
            teaCeremonyRsvp: response.teaCeremonyRsvp,
            rehearsalDinnerRsvp: response.rehearsalDinnerRsvp,
            rsvpRespondedAt: respondedAt,
            songRequests: response.songRequests,
            dietaryNotes: response.dietaryNotes,
          },
        );
        if (result.affected !== 1) {
          throw new RsvpError(409, "Your family invitation has changed. Please reload and try again.");
        }
      },
    })),
  };
}
