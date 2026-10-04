import { Table, type MigrationInterface, type QueryRunner } from "typeorm";

export class CreateGuests1791072000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "guests",
      schema: "dbo",
      columns: [
        {
          name: "id",
          type: "int",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment",
        },
        { name: "name", type: "nvarchar", length: "200" },
        { name: "email", type: "nvarchar", length: "320" },
        { name: "address", type: "nvarchar", length: "1000", isNullable: true },
        { name: "rsvp", type: "bit", default: "0" },
        { name: "tea_ceremony_invited", type: "bit", default: "0" },
        { name: "rehearsal_dinner_invited", type: "bit", default: "0" },
      ],
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("dbo.guests");
  }
}
