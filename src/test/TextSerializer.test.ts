import { format } from '../main';
import { FormatError } from '../Error';
import { parse } from 'path';
import { performance } from 'perf_hooks';
import { Optional } from '../interfaces';
import { IFormatterConfig, IHtmlSerializerConfig } from '../config/definitions';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import { TestCase, TestError, TestResult } from './common';
import * as fs from 'fs';

const serializer = new TextAstSerializer();

export function runTests(cases: TestCase[]): number
{
  let results = cases.map(c => runTestCase(c));
  let page = results.reduce((c,v) => {
    c += v.case.identifier + "-".repeat(50 - v.case.identifier.length) + "\n\n";
    if(v.error)
      c += v.error.toString();
    else
      c += v.result 
      
    c += "\n\n";
    return c;
  }, "");
  fs.writeFileSync("./testText.txt", page);
  return results.reduce((c,v) => c += v.error != null ? 1 : 0, 0)
}

function runTestCase(c: TestCase): TestResult
{
  let { identifier, code } = c;
  try
  {
    console.log(`Running TextSerializer test ${identifier}`);
    let formatterConfig: Optional<IFormatterConfig> = {
    };
    let htmlSerializerConfig: Optional<IHtmlSerializerConfig> = {
      debugMode: true
    };
    
    let start       = performance.now();
    let ast         = format(code, formatterConfig)
    let result      = serializer.serialize(ast, htmlSerializerConfig);
    let end         = performance.now();
    
    //Check if textContent == code (ignore all whitespace)
    let is     = result.replace(/\s/g, "");
    let should = code.replace(/\s/g, "");
    if(is != should)
      throw new TestError("Text result does not match source", identifier, null, is, should);
    
    try
    {
      parse(result); //check if result can be parsed
    }
    catch(error)
    {
      throw new TestError("Cannot reparse text result", identifier, null, is, should);
    }
    
    
    let converted = serializer.convertIndentation(result, " ", 2, "\t");
    is = converted.replace(/\s/g, "");
    if(is != should)
      throw new TestError("Converted tab indentation text result does not match source", identifier, null, is, should);
    try
    {
      parse(result); //check if result can be parsed
    }
    catch(error)
    {
      throw new TestError("Cannot reparse converted tab indentation text result", identifier, null, is, should);
    }
    
    console.log(`-- success in ${end-start}ms`);
    return {
      result,
      case: c
    }
  }
  catch(err)
  {
    return {
      error: err,
      case: c
    }
  }
}
