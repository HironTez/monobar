import fs from "fs";
import icoToPng from "ico-to-png";
import path from "path";
import toIco from "to-ico";
import ws from "windows-shortcuts";

export const getFiles = (folderPath: string, fileExtension: string) => {
  const files = fs.readdirSync(folderPath);
  const result: string[] = [];

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    if (fs.statSync(filePath).isFile()) {
      if (file.match(`.*\\.${fileExtension}`)?.length) {
        result.push(filePath);
      }
    }
  });

  return result;
};

export const copyFile = (
  filePath: string,
  targetPath: string,
  override = false,
) => {
  return new Promise<boolean>((resolve) => {
    const newFilePath = path.join(targetPath, path.basename(filePath));

    if (!override && fs.existsSync(newFilePath)) return resolve(true);

    fs.mkdir(targetPath, { recursive: true }, (error) => {
      if (error) {
        return resolve(false);
      }
    });

    fs.copyFile(filePath, newFilePath, (error) => {
      return resolve(!error);
    });
  });
};

export const saveFile = (buffer: Buffer, targetPath: string) => {
  fs.writeFileSync(targetPath, buffer);
};

type ShortcutMeta = {
  target: string;
  icon: string;
};

export const getShortcutMeta = (
  filePath: string,
): Promise<ShortcutMeta | null> => {
  return new Promise((resolve) => {
    ws.query(filePath.replaceAll("\\", "/"), (_, options) => {
      return resolve((options as ShortcutMeta | null) ?? null);
    });
  });
};

export const changeShortcutIcon = (filePath: string, iconPath: string) => {
  ws.edit(filePath, { icon: iconPath });
};

export const convertIcoToPng = (file: Buffer) => {
  return new Promise<Buffer>((resolve) => {
    icoToPng(file, 256).then((png) => {
      resolve(png);
    });
  });
};

export const covertPngToIco = (file: Buffer) => {
  return new Promise<Buffer>((resolve) => {
    toIco(file, { sizes: [256] }).then((ico) => {
      resolve(ico);
    });
  });
};

export const tryWithoutCatch = <T>(fn: () => T) => {
  try {
    return fn();
  } catch {
    return undefined;
  }
};
