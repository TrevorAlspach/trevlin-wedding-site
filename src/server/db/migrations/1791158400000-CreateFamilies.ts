import {
  Table,
  TableColumn,
  TableForeignKey,
  type MigrationInterface,
  type QueryRunner,
} from "typeorm";

export class CreateFamilies1791158400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "families",
      schema: "dbo",
      columns: [
        // Keep the requested varchar(1000) definition. Azure SQL limits actual
        // primary/foreign key values to 900 bytes, including this family ID.
        { name: "family_id", type: "varchar", length: "1000", isPrimary: true },
        { name: "tea_ceremony_invited", type: "bit", default: "0" },
        { name: "rehearsal_dinner_invited", type: "bit", default: "0" },
      ],
    }));

    await queryRunner.addColumn("dbo.guests", new TableColumn({
      name: "family", type: "varchar", length: "1000", isNullable: true,
    }));
    await queryRunner.createForeignKey("dbo.guests", new TableForeignKey({
      name: "FK_guests_family",
      columnNames: ["family"],
      referencedTableName: "dbo.families",
      referencedColumnNames: ["family_id"],
    }));

    await queryRunner.createTable(new Table({
      name: "family_guests",
      schema: "dbo",
      columns: [
        { name: "guest_id", type: "int", isPrimary: true },
        { name: "family_id", type: "varchar", length: "1000" },
      ],
      indices: [{ name: "IDX_family_guests_family_id", columnNames: ["family_id"] }],
      foreignKeys: [
        {
          name: "FK_family_guests_family",
          columnNames: ["family_id"],
          referencedTableName: "dbo.families",
          referencedColumnNames: ["family_id"],
        },
        {
          name: "FK_family_guests_guest",
          columnNames: ["guest_id"],
          referencedTableName: "dbo.guests",
          referencedColumnNames: ["id"],
          onDelete: "CASCADE",
        },
      ],
    }));

    // No household information exists yet. Preserve each guest's invitations
    // in a separate family so no relationships or invitations are guessed.
    await queryRunner.query(`
      INSERT INTO [dbo].[families]
        ([family_id], [tea_ceremony_invited], [rehearsal_dinner_invited])
      SELECT CONCAT('guest-', [id]), [tea_ceremony_invited], [rehearsal_dinner_invited]
      FROM [dbo].[guests]
    `);
    await queryRunner.query(`
      UPDATE [dbo].[guests] SET [family] = CONCAT('guest-', [id])
    `);
    await queryRunner.query(`
      INSERT INTO [dbo].[family_guests] ([family_id], [guest_id])
      SELECT [family], [id] FROM [dbo].[guests]
    `);

    await queryRunner.dropColumn("dbo.guests", "tea_ceremony_invited");
    await queryRunner.dropColumn("dbo.guests", "rehearsal_dinner_invited");
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("dbo.guests", new TableColumn({
      name: "tea_ceremony_invited", type: "bit", default: "0",
    }));
    await queryRunner.addColumn("dbo.guests", new TableColumn({
      name: "rehearsal_dinner_invited", type: "bit", default: "0",
    }));
    // Restore the family's current invitation flags to each assigned guest.
    // Unassigned guests retain the original false defaults.
    await queryRunner.query(`
      UPDATE guest
      SET [tea_ceremony_invited] = family.[tea_ceremony_invited],
          [rehearsal_dinner_invited] = family.[rehearsal_dinner_invited]
      FROM [dbo].[guests] AS guest
      INNER JOIN [dbo].[families] AS family ON family.[family_id] = guest.[family]
    `);
    await queryRunner.dropTable("dbo.family_guests");
    await queryRunner.dropForeignKey("dbo.guests", "FK_guests_family");
    await queryRunner.dropColumn("dbo.guests", "family");
    await queryRunner.dropTable("dbo.families");
  }
}
