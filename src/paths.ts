import path from "path";

export const PATH_TASKBAR = path.join(
  process.env.APPDATA ?? "",
  "Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar",
);

export const PATH_STORAGE = path.join(PATH_TASKBAR, ".monobar");

export const PATH_BACKUP = path.join(PATH_STORAGE, ".backup");

export const PATH_DB = path.join(PATH_STORAGE, "db.json");
