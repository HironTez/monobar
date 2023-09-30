import { getDBValue, setDBValue } from "./db.js";

import { PATH_TASKBAR } from "./paths.js";
import fs from "fs";
import { getWallpaper } from "wallpaper";
import { processIcons } from "./app.js";

const main = async (): Promise<void> => {
  if (!fs.existsSync(PATH_TASKBAR))
    throw new Error("Can't find taskbar directory");

  setInterval(async () => {
    const oldWallpaper = await getDBValue("wallpaper");
    const newWallpaper = await getWallpaper();
    if (newWallpaper && oldWallpaper !== newWallpaper) {
      const error = await processIcons();
      if (error) process.exit(0);
    }

    if (!oldWallpaper) {
      setDBValue("wallpaper", newWallpaper);
    }
  }, 10000);
};

main();
