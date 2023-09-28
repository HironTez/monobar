import {
  changeShortcutIcon,
  convertIcoToPng,
  copyFile,
  covertPngToIco,
  getFiles,
  getShortcutMeta,
  saveFile,
} from "./tools.js";

import Vibrant from "node-vibrant";
import { extractIcon } from "@inithink/exe-icon-extractor";
import fs from "fs";
import { getWallpaper } from "wallpaper";
import path from "path";
import sharp from "sharp";

const PATH_TASKBAR = path.join(
  process.env.APPDATA ?? "",
  "Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar",
);

const PATH_STORAGE = path.join(PATH_TASKBAR, ".monobar");

const main = async (): Promise<void> => {
  if (!fs.existsSync(PATH_TASKBAR))
    throw new Error("Can't find taskbar directory");

  const wallpaper = await getWallpaper();
  const colors = await Vibrant.from(wallpaper).getPalette();
  const accentColor = colors.Vibrant;

  const shortcuts = getFiles(PATH_TASKBAR, "lnk");
  for (const shortcut of shortcuts) {
    const backedUp = await copyFile(
      shortcut,
      path.join(PATH_STORAGE, ".backup"),
    );
    if (!backedUp) continue;

    const meta = await getShortcutMeta(shortcut);

    const shortcutTarget = meta?.target;
    if (!shortcutTarget) continue;

    const icon = extractIcon(shortcutTarget, "small");
    const iconPNG = await convertIcoToPng(icon);

    const newIconPNG = await sharp(iconPNG)
      .tint({
        r: accentColor?.r,
        g: accentColor?.g,
        b: accentColor?.b,
      })
      .toBuffer();

    const newIconIco = await covertPngToIco(newIconPNG);

    const newIconPath = path.join(
      PATH_STORAGE,
      path
        .basename(shortcutTarget)
        .replace(path.extname(shortcutTarget), ".png"),
    );

    saveFile(newIconIco, newIconPath);

    changeShortcutIcon(shortcut, newIconPath);
  }
};

main();
