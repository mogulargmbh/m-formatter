import * as fs from 'fs';
import * as path from 'path';
import * as glob from "glob";
export function getCases(): string[]
{
  let cases = fs.readFileSync(path.join("test-cases", "cases")).toString();
  return cases.split(/---[0-9]*/g).map(c => c.trim()).filter(c => c != "" && c != null);
}

function stripBom(text: string): string
{
  if (text.charCodeAt(0) === 0xFEFF)
    return text.slice(1);
  return text;
}


export function getConnectorCases():{name: string, code: string}[]
{
  let pattern = path.join("test-cases", "ms_connector", "*.pq");
  let files = glob.sync(pattern.replace(/\\/g, "/"), {});
  let res = [];
  for(let f of files)
  {
    res.push({
      name: path.basename(f),
      code: stripBom(fs.readFileSync(f).toString())
    });
  }
  return res;
}
