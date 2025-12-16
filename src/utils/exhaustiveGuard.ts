export default function exhaustiveCheck(x: never): never {
  throw new Error(`value not handled: ${x}`);
}
