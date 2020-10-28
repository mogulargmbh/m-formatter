export function NotSupported(...args: any[]): never
{
  throw new Error("Not supported");
}

export function getAbsoluteCodeUnit(line: number, unit: number): number
{
  return line + unit;
}

export function assertnever(_: never): never
{
  throw new Error("Should never happen");
}
