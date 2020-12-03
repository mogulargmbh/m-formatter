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
  static ErrorDir =  "./test-errors"
  constructor(
    message: string,
    public identifier: string,
    public innerError: any = null,
    public result: string = null,
    public expected: string = null
  )
  {
    super(message);
  }
  
  writeErrorFiles()
  {
    if(this.result != null)
      fs.writeFileSync(path.join(TestError.ErrorDir, `${this.identifier}_result.txt`), this.result)
    if(this.expected != null)
      fs.writeFileSync(path.join(TestError.ErrorDir, `${this.identifier}_expected.txt`), this.expected)
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
