import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const EXPECTED =
  "598b7ec3dc469814f571275929f676ce73834c469fbdb359a06fd4db4e0fc866";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dllPath = path.join(
  root,
  "vendor/nvdaControllerClient/nvdaControllerClient.dll"
);

if (!existsSync(dllPath)) {
  console.error("Missing DLL:", dllPath);
  process.exit(1);
}

const hash = createHash("sha256").update(readFileSync(dllPath)).digest("hex");
if (hash !== EXPECTED) {
  console.error("SHA-256 mismatch for nvdaControllerClient.dll");
  console.error(" expected:", EXPECTED);
  console.error("   actual:", hash);
  process.exit(1);
}

console.log("OK nvdaControllerClient.dll", hash);
