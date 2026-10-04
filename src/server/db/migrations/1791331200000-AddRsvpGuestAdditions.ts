import { TableColumn, TableIndex, type MigrationInterface, type QueryRunner } from "typeorm";

export class AddRsvpGuestAdditions1791331200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("dbo.guests", new TableColumn({
      name: "rsvp_addition_id", type: "uniqueidentifier", isNullable: true,
    }));
    await queryRunner.createIndex("dbo.guests", new TableIndex({
      name: "IDX_guests_rsvp_addition_id", columnNames: ["rsvp_addition_id"],
      isUnique: true, where: "[rsvp_addition_id] IS NOT NULL",
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("dbo.guests", "IDX_guests_rsvp_addition_id");
    await queryRunner.dropColumn("dbo.guests", "rsvp_addition_id");
  }
}
