import { PATH_DB } from "./paths.js";
import fs from "fs";
import { tryWithoutCatch } from "./tools.js";

type DBT = Record<string, string>;

const getDB = () => {
  return new Promise<DBT>((resolve) => {
    fs.readFile(PATH_DB, "utf-8", (error, data) => {
      if (error) return resolve({});

      resolve(tryWithoutCatch(() => JSON.parse(data)) ?? {});
    });
  });
};

const setDB = (db: DBT) => {
  const value = tryWithoutCatch(() => JSON.stringify(db));
  if (value) {
    fs.writeFile(PATH_DB, value, () => {});
  }
};

export const getDBValue = (key: string) => {
  return new Promise<string | null>((resolve) => {
    getDB().then((db) => {
      const value = db[key] ?? null;

      resolve(value);
    });
  });
};

export const setDBValue = (key: string, value: string) => {
  getDB().then((db) => {
    db[key] = value;
    setDB(db);
  });
};
