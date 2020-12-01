import * as fs from 'fs';
import * as path from 'path';
import * as glob from "glob";
import { FormatError } from '../main';

export type TestCase =
{
  identifier: string;
  code: string;
}

export class TestError extends Error
{
  constructor(
    message: string,
    private identifier: string,
    private innerError: any = null,
    private result: string = null,
    private expected: string = null
  )
  {
    super(message);
  }
}

export type TestResult = { result?: string, error?: FormatError|TestError|Error, case: TestCase};

export function getCases(): TestCase[]
{
  let cases = fs.readFileSync(path.join("test-cases", "cases")).toString();
  return cases.split(/---[0-9]*/g).map(c => c.trim()).filter(c => c != "" && c != null).map((c,i) => {
    return {
      code: c,
      identifier: i.toString()
    };
  });
}

function stripBom(text: string): string
{
  if (text.charCodeAt(0) === 0xFEFF)
    return text.slice(1);
  return text;
}

export function getConnectorCases():TestCase[]
{
  let pattern = path.join("test-cases", "ms_connector", "*.pq");
  let files = glob.sync(pattern.replace(/\\/g, "/"), {});
  let res: TestCase[] = [];
  for(let f of files)
  {
    res.push({
      identifier: path.basename(f),
      code: stripBom(fs.readFileSync(f).toString())
    });
  }
  return res;
}
