import { format } from '../main';
import * as jsdom from "jsdom";
import { getCases, getConnectorCases, TestCase, TestError, TestResult } from './common';
import * as fs from "fs";
import { FormatError } from '../Error';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import { parse } from 'path';
import { performance } from 'perf_hooks';
import { Optional } from '../interfaces';
import { IFormatterConfig, IHtmlSerializerConfig, ITextAstSerializerConfig } from '../config/definitions';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import { defaultHtmlSerializerConfig } from '../config/default';

const serializer = new HtmlAstSerializer();


export function runTests(cases: TestCase[]): number
{
  let results = cases.map(c => runTestCase(c));
  let page = buildTestPage(results);
  fs.writeFileSync("./testPage.html", page);
  return results.reduce((c,v) => c += v.error != null ? 1 : 0, 0)
}

function runTestCase(c: TestCase): TestResult
{
  let {identifier, code } = c;
  try
  {
    console.log(`Running HtmlSerializer test ${identifier}`);
    let formatterConfig: Optional<IFormatterConfig> = {
    };
    let htmlSerializerConfig: Optional<IHtmlSerializerConfig> = {
      debugMode: true
    };
    
    let start       = performance.now();
    let ast         = format(code, formatterConfig)
    let result  = serializer.serialize(ast, htmlSerializerConfig);
    let end         = performance.now();
    
    let el      = new jsdom.JSDOM(`<!DOCTYPE html>${result}`);
    let content = el.window.document.body.textContent;
    
    //Check if textContent == code (ignore all whitespace)
    let is     = content.replace(/\s/g, "");
    let should = code.replace(/\s/g, "");
    if(is != should)
      throw new TestError("Html result does not match source", identifier, null, is, should);
      
    //check if textContent can be parsed
    try
    {
      parse(content);
    }
    catch(error)
    {
      throw new TestError("Cannot reparse html result", identifier, null, is, should);
    }
    
    console.log(`-- success in ${end-start}ms`);
    return {
      result,
      case: c
    };
  }
  catch(err)
  {
    return {
      error: err,
      case: c
    };
  }
}

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
    ${defaultHtmlSerializerConfig.inlineCss}
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
