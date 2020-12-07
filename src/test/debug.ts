import { ExtendedNode, FormatError, IFormatterConfig } from '../main';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import * as clipboard from 'clipboardy';
import { formatCode, parse, format } from '../formatter';
import { getCases, getConnectorCases, TestError } from './common';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import * as HtmlTests from "./HtmlSerializer.test";
import * as TextTests from "./TextSerializer.test";
import { extendAll, assignComments } from '../Factory';
import * as fs from "fs";
import { Optional } from '../interfaces';
import { TComment } from '../pq-ast';

let code = ""
let c = null;
const txt = new TextAstSerializer();
const html = new HtmlAstSerializer();

let cases = getCases();
c = cases[46];

// let code = "\nlet \n  GetParameterImpl=(tableName as any, keyName) as any => \n    let\n      value = Table.SelectRows(tableData, each ([Key] = keyName)){0}[Value],\n      tableData = Excel.CurrentWorkbook(){[Name=tableName]}[Content]\n    in \n      value,\n  GetParameterImpl=(t) as null => testtttttttttt,\n  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = @test,\n  Test=Number.Add\nin \n  GetParameterImpl"
// let connectorCases = getConnectorCases();
// c = connectorCases.find(c => c.identifier == "SqlODBC.pq");

code = c.code;


// let code = `
// section test;
// shared //asd 
// hallo = 3;`


// debugTest();
test(code);



function form(code: string, config: Optional<IFormatterConfig>, result: "txt"|"html", serializerConfig = null): [code: string, ast: ExtendedNode, comments: TComment[]]
{
  let [ast, comments] = parse(code);
  let ext = extendAll(ast);
  assignComments(ext, comments.slice());
  let formatted = format(ext, config);
  let s = result == "txt" ? txt : html;
  let r = s.serialize(formatted, serializerConfig);
  return [r, ext, comments];
}

function test(code: string)
{
  try
  {
    // let r = form(code, {lineWidth: 61}, "txt");
    // code = r[0];
    // console.log(r[0]);
    let [res, ast, comments] = form(code, {}, "html", {debugMode: true});
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

function debugTest()
{
  let r = TextTests.runTestCase(c);
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