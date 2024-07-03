import fs from "fs/promises";

export async function readJsonFile(filePath) {
  return JSON.parse((await fs.readFile(filePath)).toString());
}
