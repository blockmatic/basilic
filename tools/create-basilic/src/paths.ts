import { join } from "node:path";

const srcDir = import.meta.dirname;

export const packageRoot = join(srcDir, "..");

export const repoRootFromPackage = join(packageRoot, "../..");

export const manifestPath = join(packageRoot, "manifest.json");

export const bundledTemplateRoot = join(packageRoot, "template");
