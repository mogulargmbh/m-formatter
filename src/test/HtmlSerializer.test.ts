import * as jsdom from "jsdom";
import { getCases, getConnectorCases, TestCase, TestError, TestResult } from './common';
import * as fs from "fs";
import { FormatError } from '../Error';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import { performance } from 'perf_hooks';
import { Optional } from '../interfaces';
import { IFormatterConfig, IHtmlAstSerializerConfig, ITextAstSerializerConfig } from '../config/definitions';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import { defaultHtmlSerializerConfig } from '../config/default';
import { formatCode, parse } from '../formatter';

const serializer = new HtmlAstSerializer();

export function runTests(cases: TestCase[]): number
{
  let results = cases.map(c => runTestCase(c));
  let page = buildTestPage(results);
  fs.writeFileSync("./testPage.html", page);
  return results.reduce((c,v) => c += v.error != null ? 1 : 0, 0)
}

export function runTestCase(c: TestCase): TestResult
{
  let {identifier, code } = c;
  try
  {
    console.log(`Running HtmlSerializer test ${identifier}`);
    let formatterConfig: Optional<IFormatterConfig> = {
    };
    let htmlSerializerConfig: Optional<IHtmlAstSerializerConfig> = {
      debugMode: true
    };
    
    let start       = performance.now();
    let ast         = formatCode(code, formatterConfig);
    let result      = serializer.serialize(ast, htmlSerializerConfig);
    let end         = performance.now();
    
    let el      = new jsdom.JSDOM(
`<!DOCTYPE html>
<html>
<head>
<style>
.body {
  white-space: pre;
}
</style>

</head>
<body>
${result}
</body>
</html>
`);
    let content = el.window.document.body.textContent;
    
    //Check if textContent == code (ignore all whitespace)
    let is     = content.replace(/\s/g, "");
    let should = code.replace(/\s/g, "");
    if(is != should)
      throw new TestError("Html result does not match source", identifier, null, is, should);
      
    //check if textContent can be parsed
    // try
    // {
    //   parse(content);
    // }
    // catch(error)
    // {
    //   throw new TestError("Cannot reparse html result", identifier, null, is, should);
    // }
    
    console.log(`-- success in ${end-start}ms`);
    return {
      result,
      case: c
    };
  }
  catch(err)
  {
    console.error(err.message);
    return {
      error: err,
      case: c
    };
  }
}

let defaultCss = `
.constant.keyword {
  color: #c586c0;
}

.constant.unknown-node {
  color: red;
}

.constant {
  color: #d4d4d4;
}

.comment {
  color: #6A9955;
}

.identifier {
  color: #9cdcfe;
}

.identifier.method-call {
  color: #DCDCAA;
}

.operator {
  color: #d4d4d4;
}

.operator.operator-dot {
  color: #D4D4D4;
}

.operator.operator-keyword {
  color: #569CD6;
}

.operator.operator-unary {
  color: #569CD6;
}

.bracket {
  font-weight: bold;
}

.bracket-0 {
  color: Gold;
}

.bracket-1 {
  color: GoldenRod;
}

.bracket-2 {
  color: DarkGoldenRod;
}

.type {
  color: #4ec9b0;
}

.literal.null {
  color: #569cd6;
}

.literal.boolean {
  color: #569cd6;
}

.literal.string {
  color: #ce9178;
}

.literal {
  color: #dcdcaa;
}
`


function buildTestPage(results: TestResult[]): string
{
  function *build()
  {
    yield `
<html>
  <head>
    <style>
    body {
      background-color: #1E1E1E;
      color: white;
      font-family: "Lucida Console", Courier, monospace;
      white-space: pre;
    }
    ${defaultCss}
    h3 {
      margin-top: 5px;
      margin-bottom: 5px;
    }
    </style>
  </head>
<body style="position: relative;" onload="load()">
<script>
function load()
{
  let w = document.querySelector("#width");
  let b = document.querySelector("#border");
  let rect = w.getBoundingClientRect();
  b.style.left = rect.width + "px";
  w.style.display = 'none';
}
</script>
<div id="border" style="position: absolute; left: 100em; height: 100%; width: 1px; background-color: red">
</div>
<div><span id="width">${"a".repeat(100)}</span></div>`;
    for(let res of results)
    {
      yield "<h3>" + res.case.identifier + "</h3>";
      yield "<div>";
      if(res.error)
      {
        yield `<div style="color: red">${res.error.toString()}</div>`;
        yield "Code:<br/>";
        yield res.result;
      }
      else
      {
        yield res.result;
      }
      yield "</div>";
      yield "<hr/>";
    }
    yield "</body></html>";
  }
  return Array.from(build()).join("\n");
}
