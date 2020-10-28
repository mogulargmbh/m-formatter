import { format } from '../main';
import * as jsdom from "jsdom";
import { getCases, getConnectorCases } from './common';
import * as fs from "fs";
import { buildTestPage } from './testPage';
import { FormatError } from '../Error';
import { HtmlAstSerializer } from '../serializer/HtmlAstSerializer';
import { parse } from 'path';

let results: [string|FormatError,number,string][] = [];

let serializer = new HtmlAstSerializer();
function runTest(code: string, identifier: any)
{
  console.log(`Running test ${identifier}`);
  try
  {
    let formatterConfig = {
      
    };
    let ast = format(code, formatterConfig)
    let result = serializer.serialize(ast, {
      debugMode: true
    })
    
    
    let el = new jsdom.JSDOM(`<!DOCTYPE html>${result}`);
    let content = el.window.document.body.textContent;
    
    //Check if textContent == code (ignore all whitespace)
    let is = content.replace(/\s/g, "");
    let should = code.replace(/\s/g, "");
    if(is != should)
      console.log(`Test ${identifier} failed\nShould/Result:\n${should}\n${content}`);
      
    //check if textContent can be parsed
    parse(content);
    
    results.push([result, identifier, code]);
  }
  catch(err)
  {
    console.log(err.message);
    results.push([err, identifier, code]);
  }
}

async function main()
{
  let i = 0;
  let cases = getCases();
  for(let c of cases)
  {
    runTest(c, i);
    i++;
  }
  
  let connectorCases = await getConnectorCases();
  for(let c of connectorCases)
  {
    runTest(c.code, c.name);
  }
  
  console.log("Writing resulting testpage to './testPage.html'");
  fs.writeFileSync("./testPage.html", buildTestPage(results));
}

main()
  .then(() => console.log("tests finished"))
  .catch(e => console.error(e));