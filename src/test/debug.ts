import { ExtendedNode, FormatError, IFormatterConfig } from '../main';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import * as clipboard from 'clipboardy';
import { formatCode, parse, format } from '../formatter';
import { getCases, getConnectorCases, } from './common';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import * as HtmlTests from "./HtmlSerializer.test";
import * as TextTests from "./TextSerializer.test";
import { extendAll } from '../Factory';
import * as fs from "fs";
import { Optional } from '../interfaces';
import { TComment } from '@microsoft/powerquery-parser/lib/language/comment';

const txt = new TextAstSerializer();
const html = new HtmlAstSerializer();
// let cases = getCases();
// let code = cases[42].code;

// let code = "\nlet \n  GetParameterImpl=(tableName as any, keyName) as any => \n    let\n      value = Table.SelectRows(tableData, each ([Key] = keyName)){0}[Value],\n      tableData = Excel.CurrentWorkbook(){[Name=tableName]}[Content]\n    in \n      value,\n  GetParameterImpl=(t) as null => testtttttttttt,\n  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = @test,\n  Test=Number.Add\nin \n  GetParameterImpl"

let connectorCases = getConnectorCases();
let c = connectorCases.find(c => c.identifier == "SqlODBC.pq");
// let code = c.code;

let code = `
section test;
shared //asd 
hallo = 3;`

// TextTests.runTestCase(c);
test(code);



function form(code: string, config: Optional<IFormatterConfig>, result: "txt"|"html", serializerConfig = null): [code: string, ast: ExtendedNode, comments: TComment[]]
{
  let [ast, comments] = parse(code);
  let ext = extendAll(ast, comments.slice());
  let formatted = format(ext, config);
  let s = result == "txt" ? txt : html;
  let r = s.serialize(formatted, serializerConfig);
  return [r, ext, comments];
}

function test(code: string)
{
  try
  {
    clipboard.writeSync(form(code, {lineWidth: 61}, "html", {debugMode: true})[0])
    let r = form(code, {lineWidth: 61}, "txt");
    console.log(r[0]);
    let [res, ast, comments] = form(r[0], {lineWidth: 61}, "html", {debugMode: true});
    
    
    console.log(res);
    clipboard.writeSync(res);
  }
  catch(error)
  {
    if(error instanceof FormatError)
      throw error;
    else 
      throw new FormatError("Could not format code", "FORMATTER_ERROR", error);
  }
}
