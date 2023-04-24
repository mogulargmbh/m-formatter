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
c = cases[48];

// let code = "\nlet \n  GetParameterImpl=(tableName as any, keyName) as any => \n    let\n      value = Table.SelectRows(tableData, each ([Key] = keyName)){0}[Value],\n      tableData = Excel.CurrentWorkbook(){[Name=tableName]}[Content]\n    in \n      value,\n  GetParameterImpl=(t) as null => testtttttttttt,\n  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa = @test,\n  Test=Number.Add\nin \n  GetParameterImpl"
// let connectorCases = getConnectorCases();
// c = connectorCases.find(c => c.identifier == "SqlODBC.pq");

// code = `
// let
// 	Source        = Sales[Order Date],
// 	DistinctDates = List.Buffer(List.Distinct(Sales[Order Date])),
// 	DateList      =
//         let
// 	      ConstYear        = 1,
// 	      MinDate          = List.Min(DistinctDates),
// 	      MinYear          = Date.Year(MinDate) - ConstYear,
// 	      MaxDate          = List.Max(DistinctDates),
// 	      MaxYear          = Date.Year(MaxDate) + ConstYear,
// 	      FirstDate        = #date(MinYear, 1, 1),
// 	      LastDate         = #date(MaxYear, 12, 31),
// 	      ListOfDate       = {Number.From(FirstDate) .. Number.From(LastDate)},
// 	      ConvertToTable   = Table.FromList(ListOfDate, Splitter.SplitByNothing()),
// 	      ChangeColumnName = Table.RenameColumns(ConvertToTable, {{"Column1", "Date"}}) + 3,
// 	      ChangeType       = Table.TransformColumnTypes(ChangeColumnName, {{"Date", type date}})
//         in
// 	      ChangeType,
// 	YearNumber    = Table.AddColumn(DateList, "Calendar Year Number", each Date.Year([Date]), Int64.Type),
// 	YearText      = Table.AddColumn(YearNumber, "Calendar Year", each "CY " & Text.From([Calendar Year Number]), type text)
// in
// 	YearText
// `

code = c.code;

code = `
let
  fn = (Start_Year as number, End_Year as number) =>
    let
      monthList = List.Generate(
        () => #date(Start_Year, 1, 1),  // Starting value
        each _ <= #date(End_Year, 12, 31),  // Create only when <= 31 dec 2024
        each Date.AddMonths(_, 1)
      ), 
      build_Table = Table.FromList(
        monthList, 
        Splitter.SplitByNothing(), 
        type table [Date = Date.Type], 
        null, 
        ExtraValues.Error
      ), 
      add_Records = Table.AddColumn(
        build_Table, 
        "_Table", 
        each [
          Year = Date.Year([Date]),  // Returns the year number
          Month = Date.MonthName([Date]),  // Returns month name
          MonthNUM = Date.Month([Date]),  // Returns Month Number
          MonthYEAR
            = Date.ToText(
            [Date], 
            "MMM-yy"
          ) // Returns Short Month and Year, e.g. Jan 2023                                                                                                                                                                                                                                                                                                                                  
        ], 
        type [Year = number, Month = text, MonthNUM = number, MonthYEAR = text]
      ), 
      expandColumns = Table.ExpandRecordColumn(
        add_Records, 
        "_Table", 
        {"Year", "Month", "MonthNUM", "MonthYEAR"}, 
        {"Year", "Month", "MonthNUM", "MonthYEAR"}
      )
    in
      expandColumns
in
  fn
`

// let code = `
// section test;
// shared //asd 
// hallo = 3;`


// debugTest();
test(code).then(() => console.log("----------\nfin"));



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
    let [res, ast, comments] = await form(code, {surroundBracesWithWs: false}, "txt", {debugMode: true});
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