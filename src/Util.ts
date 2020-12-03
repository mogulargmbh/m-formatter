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

const newLineRegex = /(\r\n|\n)/g;

export function spliteByLineEnd(str: string): string[]
{
  return str.split(newLineRegex).filter(e => newLineRegex.test(e) == false);
}