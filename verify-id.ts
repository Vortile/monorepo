import { generateId } from "./packages/database/src/ids";

const id = generateId();
console.log(`Generated ID: ${id}`);

if (typeof id === "string" && id.length === 36) {
  console.log("ID format is valid.");
} else {
  console.error("Invalid ID format.");
  process.exit(1);
}
