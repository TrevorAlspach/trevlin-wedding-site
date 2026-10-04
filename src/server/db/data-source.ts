import { DataSource } from "typeorm";
import { databaseOptions } from "./config.js";

// One pool per process, shared by repositories and the TypeORM migration CLI.
const database = new DataSource(databaseOptions());
export default database;
