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

const PATH_BACKUP = path.join(PATH_STORAGE, ".backup");

const main = async (): Promise<void> => {
  if (!fs.existsSync(PATH_TASKBAR))
    throw new Error("Can't find taskbar directory");

  // Get accent color from the wallpaper
  const wallpaper = await getWallpaper();
  const colors = await Vibrant.from(wallpaper).getPalette();
  const accentColor = colors.LightVibrant;

  const shortcuts = getFiles(PATH_TASKBAR, "lnk");
  for (const shortcut of shortcuts) {
    // Restore backup or create a backup if it doesn't exist
    const shortcutBackupPath = path.join(PATH_BACKUP, path.basename(shortcut));
    await copyFile(shortcutBackupPath, PATH_TASKBAR, true);
    const backedUp = await copyFile(shortcut, PATH_BACKUP);
    if (!backedUp) continue;

    // Get icon path
    const meta = await getShortcutMeta(shortcut);
    const shortcutTarget = meta?.target;
    const shortcutIcon = meta?.icon;
    const targetPath = (shortcutTarget || shortcutIcon) ?? null;
    if (!targetPath) continue;

    // Extract the icon
    const icon = extractIcon(targetPath, "large");

    // Edit the icon
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
      path.basename(targetPath).replace(path.extname(targetPath), ".ico"),
    );

    // Save the new icon
    saveFile(newIconIco, newIconPath);

    // Apply the new icon
    changeShortcutIcon(shortcut, newIconPath);
  }
};

main();
