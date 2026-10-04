import { TableColumn, type MigrationInterface, type QueryRunner } from "typeorm";

export class AddGuestRsvpResponses1791244800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("dbo.guests", [
      new TableColumn({ name: "tea_ceremony_rsvp", type: "bit", isNullable: true }),
      new TableColumn({ name: "rehearsal_dinner_rsvp", type: "bit", isNullable: true }),
      new TableColumn({ name: "rsvp_responded_at", type: "datetime2", isNullable: true }),
      new TableColumn({ name: "song_requests", type: "nvarchar", length: "1000", isNullable: true }),
      new TableColumn({ name: "dietary_notes", type: "nvarchar", length: "2000", isNullable: true }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("dbo.guests", [
      "dietary_notes",
      "song_requests",
      "rsvp_responded_at",
      "rehearsal_dinner_rsvp",
      "tea_ceremony_rsvp",
    ]);
  }
}
