import "reflect-metadata";
import { fileURLToPath } from "node:url";
import type { DataSourceOptions } from "typeorm";
import { GuestSchema } from "./guest.js";

export function databaseOptions(env: NodeJS.ProcessEnv = process.env) {
  const host = env.AZURE_SQL_SERVER?.trim();
  const database = env.AZURE_SQL_DATABASE?.trim();
  const clientId = env.AZURE_CLIENT_ID?.trim();

  if (!host || !database) {
    throw new Error("AZURE_SQL_SERVER and AZURE_SQL_DATABASE are required");
  }
  if ((env.NODE_ENV === "production" || env.IDENTITY_ENDPOINT) && !clientId) {
    throw new Error("AZURE_CLIENT_ID is required for the user-assigned managed identity");
  }

  return {
    type: "mssql",
    host,
    database,
    port: 1433,
    schema: "dbo",
    // Tedious uses ManagedIdentityCredential for this mode and obtains fresh
    // tokens when opening connections. Local development uses az login instead.
    authentication: clientId
      ? { type: "azure-active-directory-msi-app-service", options: { clientId } }
      : { type: "azure-active-directory-default", options: {} },
    options: { encrypt: true, trustServerCertificate: false, useUTC: true },
    pool: { min: 0, max: 5, idleTimeoutMillis: 30_000 },
    connectionTimeout: 30_000,
    requestTimeout: 30_000,
    entities: [GuestSchema],
    migrations: [fileURLToPath(new URL("./migrations/*.js", import.meta.url))],
    migrationsTableName: "typeorm_migrations",
    synchronize: false,
    migrationsRun: false,
    logging: false,
    invalidWhereValuesBehavior: { null: "throw", undefined: "throw" },
  } satisfies DataSourceOptions;
}
