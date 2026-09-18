import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..");
const workspaceRoot = resolve(packageRoot, "../..");
const output = resolve(packageRoot, "blueprint");

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });
await cp(resolve(workspaceRoot, "packages/ui/src"), output, { recursive: true });
await mkdir(resolve(output, "styles"), { recursive: true });
await cp(
  resolve(workspaceRoot, "packages/theme/src/index.css"),
  resolve(output, "styles/suhdo.css"),
);
await mkdir(resolve(output, "docs"), { recursive: true });
await cp(
  resolve(workspaceRoot, "docs/suhdo-ui.md"),
  resolve(output, "docs/suhdo-ui.md"),
);
