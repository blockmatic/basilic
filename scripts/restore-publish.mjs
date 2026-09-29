import fs from "node:fs";
import path from "node:path";

const pkgPath = path.resolve(process.cwd(), "package.json");
const tempPath = path.resolve(process.cwd(), ".package-originals.json");

if (!fs.existsSync(tempPath)) {
  // No originals stored, skip restore
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const originals = JSON.parse(fs.readFileSync(tempPath, "utf-8"));

// Restore original exports (handle null/undefined)
if (originals.exports === null) {
  delete pkg.exports;
} else {
  pkg.exports = JSON.parse(originals.exports);
}

if (originals.main === null) {
  delete pkg.main;
} else {
  pkg.main = originals.main;
}

if (originals.types === null) {
  delete pkg.types;
} else {
  pkg.types = originals.types;
}

delete pkg.files;

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
fs.unlinkSync(tempPath);
