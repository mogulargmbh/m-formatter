import * as clipboard from 'clipboardy';
import * as fs from "fs";
import { assignComments, extendAll } from '../Factory';
import { format, parse } from '../formatter';
import { Optional } from '../interfaces';
import { ExtendedNode, FormatError, IFormatterConfig } from '../main';
import { TComment } from '../pq-ast';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import { getCases, TestError } from './common';
import * as TextTests from "./TextSerializer.test";

let code = ""
const txt = new TextAstSerializer();
const html = new HtmlAstSerializer();

let cases = getCases();
let c = cases[55];


test(c.code).then(() => console.log("----------\nfin"));



async function form(code: string, config: Optional<IFormatterConfig>, result: "txt"|"html", serializerConfig = null): Promise<[code: string, ast: ExtendedNode, comments: TComment[]]>
{
  let [ast, comments] = await parse(code);
  let ext = extendAll(ast);
  assignComments(ext, comments.slice());
  let formatted = format(ext, config);
  let s = result == "txt" ? txt : html;
  let r = s.serialize(formatted, serializerConfig);
  return [r, ext, comments];
}

async function test(code: string)
{
  try
  {
    // let r = form(code, {lineWidth: 61}, "txt");
    // code = r[0];
    // console.log(r[0]);
    let [res, ast, comments] = await form(code, {surroundBracesWithWs: false, replaceLfInStrings: true}, "txt", {debugMode: true});
    // let ast2 = format(ast, {});
    // let res2 = html.serialize(ast2, {debugMode: true} as any);
    // console.log(res == res2);
    // writeDiffFiles(res, res2);
    clipboard.writeSync(res);
    console.log(res);
    // clipboard.writeSync(res2);
  }
  catch(error)
  {
    if(error instanceof FormatError)
      throw error;
    else 
      throw new FormatError("Could not format code", "FORMATTER_ERROR", error);
  }
}

function writeDiffFiles(r1, r2)
{
  fs.writeFileSync("./debug1.txt", r1);
  fs.writeFileSync("./debug2.txt", r2);
}

async function debugTest()
{
  let formatterConfig: Optional<IFormatterConfig> = {};
  let r = await TextTests.runTestCase(c, formatterConfig);
  if(r.error)
  {
    if(r.error instanceof TestError)
    {
      fs.writeFileSync("is.txt", r.error.result);
      if(r.error.expected != null)
        fs.writeFileSync("should.txt", r.error.expected);
    }
    else
    {
      throw r.error
    }
  }
}