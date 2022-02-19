import cac from "cac";
import fs from "fs";
import path from "path";
import { imageHash } from "image-hash";

export const getImagePaths = (dirPath: string): Promise<string[]> => {
  return new Promise((resolve) => {
    resolve(
      fs
        .readdirSync(dirPath)
        .filter((fname) => /\.(jpe?g|png|webp)$/.test(fname))
        .map((fname) => path.join(dirPath, fname))
    );
  });
};

export const calcImageHash = async (imagePath: string): Promise<string> => {
  return new Promise((res, rej) => {
    imageHash(imagePath, 16, true, (error: Error, data: any) => {
      if (error) {
        console.log(`fail: ${imagePath}`);
        res("");
      }
      res(data);
    });
  });
};

export const findDuplicate = async (dirPath: string) => {
  const paths = await getImagePaths(dirPath);
  const hashes = await Promise.all(paths.map(calcImageHash));

  const conflictHashes = new Set<string>();
  let hashPathsMap: { [k in string]: string[] } = {};

  paths.forEach((path, i) => {
    const hash = hashes[i];
    if (!hash) return;
    if (hashPathsMap[hash]) {
      conflictHashes.add(hash);
      hashPathsMap[hash].push(path);
    } else {
      hashPathsMap[hash] = [path];
    }
  });
  return Array.from(conflictHashes).map((hash) => hashPathsMap[hash]);
};

const cli = cac();

cli.command("<path>", "find duplicate images").action(async (dirPath) => {
  if (!dirPath) {
    console.log("error");
  }
  const imageSetList = await findDuplicate(dirPath);
  if (imageSetList.length === 0) {
    console.log("No duplicate images were found.");
    return;
  }
  console.log(
    imageSetList.map((imageSet) => imageSet.join("\n")).join("\n\n---\n\n")
  );
});

cli.help();
cli.version("0.0.0");

if (process.env.NODE_ENV !== "test") {
  cli.parse();
}
