import { performance } from 'perf_hooks';
import { Optional } from '../interfaces';
import { IFormatterConfig, IHtmlAstSerializerConfig, ITextAstSerializerConfig } from '../config/definitions';
import { TextAstSerializer } from '../serializer/TextAstSerializer';
import { TestCase, TestError, TestResult } from './common';
import * as fs from 'fs';
import { formatCode, format, parse, extendAndFormat } from '../formatter';

const serializer = new TextAstSerializer();

export function runTests(cases: TestCase[], formatterConfig: Optional<IFormatterConfig>): number
{
  let results = cases.map(c => runTestCase(c, formatterConfig));
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

export function runTestCase(c: TestCase, formatterConfig: Optional<IFormatterConfig>): TestResult
{
  let { identifier, code } = c;
  try
  {
    console.log(`Running TextSerializer test ${identifier}`);
    let textSerializerConfig: Optional<ITextAstSerializerConfig> = {
    };
    
    let start              = performance.now();
    let [parsed, comments] = parse(code);
    let ast                = extendAndFormat(parsed, comments, formatterConfig);
    let result             = serializer.serialize(ast, textSerializerConfig);
    let end                = performance.now();
    
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
      throw new TestError("Cannot reparse text result", identifier, null, result, null);
    }
    
    
    let converted = serializer.convertIndentation(result, " ", 2, "\t");
    is = converted.replace(/\s/g, "");
    if(is != should)
      throw new TestError("Converted tab indentation text result does not match source", identifier, null, is, should);
    try
    {
      parse(converted); //check if result can be parsed
    }
    catch(error)
    {
      throw new TestError("Cannot reparse converted tab indentation text result", identifier, null, converted, null);
    }
    
    let formatted2 = format(ast, formatterConfig)
    let result2 = serializer.serialize(formatted2, textSerializerConfig);
    if(result != result2)
      throw new TestError("Second format pass yielded different result", identifier, null, result2, result);
    
    console.log(`-- success in ${end-start}ms`);
    return {
      result,
      case: c
    }
  }
  catch(err)
  {
    console.error(err.message);
    if(err instanceof TestError)
      err.writeErrorFiles();
    return {
      error: err,
      case: c
    }
  }
}
