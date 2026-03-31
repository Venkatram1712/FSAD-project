import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC_DIR = "src";
const disallowed = [];

function walk(dirPath) {
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      disallowed.push(relative(process.cwd(), fullPath));
    }
  }
}

walk(join(process.cwd(), SRC_DIR));

if (disallowed.length > 0) {
  console.error("JS-only policy failed. Remove these TypeScript files:");
  for (const filePath of disallowed) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log("JS-only policy passed: no .ts/.tsx files found in src.");